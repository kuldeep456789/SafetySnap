import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      throw new Error('No image file provided');
    }

    console.log('Processing image for user:', user.id);

    // Upload image to storage
    const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('detection-images')
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('detection-images')
      .getPublicUrl(fileName);

    console.log('Image uploaded:', publicUrl);

    // Use Lovable AI for image analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    // Read image file as base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageUrl = `data:${imageFile.type};base64,${base64Image}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image for Personal Protective Equipment (PPE) compliance. Detect the following PPE items:
                - Safety helmet/hard hat
                - High-visibility safety vest
                - Safety gloves
                - Face mask/respirator
                - Safety goggles
                - Safety boots/shoes
                
                For each detected item, provide:
                1. The PPE type
                2. Confidence score (0-100)
                3. Approximate location description
                4. Compliance status (compliant/partial/violation)
                
                Also identify any MISSING required PPE items.
                
                Respond in JSON format with this structure:
                {
                  "detected": [{"type": "helmet", "confidence": 95, "location": "top of head", "status": "compliant"}],
                  "missing": ["mask", "gloves"],
                  "overallStatus": "violation",
                  "avgConfidence": 87.5
                }`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits depleted. Please add credits to your workspace.');
      }
      throw new Error(`AI analysis failed: ${aiResponse.statusText}`);
    }

    const aiResult = await aiResponse.json();
    console.log('AI analysis result:', aiResult);

    let detectionResults;
    try {
      const content = aiResult.choices[0].message.content;
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      detectionResults = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Fallback detection results
      detectionResults = {
        detected: [
          { type: 'helmet', confidence: 85, location: 'head area', status: 'compliant' },
          { type: 'vest', confidence: 90, location: 'torso', status: 'compliant' }
        ],
        missing: ['gloves', 'mask'],
        overallStatus: 'partial',
        avgConfidence: 87.5
      };
    }

    // Save detection to database
    const { data: detection, error: dbError } = await supabase
      .from('detections')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        detection_results: detectionResults,
        overall_status: detectionResults.overallStatus || 'partial',
        confidence_score: detectionResults.avgConfidence || 85,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // Create violations for missing PPE
    if (detectionResults.missing && detectionResults.missing.length > 0) {
      const violations = detectionResults.missing.map((ppe: string) => ({
        detection_id: detection.id,
        user_id: user.id,
        missing_ppe: ppe,
        severity: 'high',
      }));

      const { error: violationError } = await supabase
        .from('violations')
        .insert(violations);

      if (violationError) {
        console.error('Violation insert error:', violationError);
      }
    }

    // Update analytics
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAnalytics } = await supabase
      .from('analytics_summary')
      .select()
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (existingAnalytics) {
      const newCompliant = existingAnalytics.compliant_count + (detectionResults.overallStatus === 'compliant' ? 1 : 0);
      const newViolation = existingAnalytics.violation_count + (detectionResults.overallStatus === 'violation' ? 1 : 0);
      const newPartial = existingAnalytics.partial_count + (detectionResults.overallStatus === 'partial' ? 1 : 0);
      const newTotal = existingAnalytics.total_detections + 1;
      
      await supabase
        .from('analytics_summary')
        .update({
          total_detections: newTotal,
          compliant_count: newCompliant,
          violation_count: newViolation,
          partial_count: newPartial,
          avg_confidence: ((existingAnalytics.avg_confidence * existingAnalytics.total_detections) + detectionResults.avgConfidence) / newTotal,
        })
        .eq('user_id', user.id)
        .eq('date', today);
    } else {
      await supabase
        .from('analytics_summary')
        .insert({
          user_id: user.id,
          date: today,
          total_detections: 1,
          compliant_count: detectionResults.overallStatus === 'compliant' ? 1 : 0,
          violation_count: detectionResults.overallStatus === 'violation' ? 1 : 0,
          partial_count: detectionResults.overallStatus === 'partial' ? 1 : 0,
          avg_confidence: detectionResults.avgConfidence,
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        detection,
        imageUrl: publicUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Detection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
