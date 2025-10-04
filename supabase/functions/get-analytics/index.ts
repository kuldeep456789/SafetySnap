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

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '7');

    console.log(`Fetching analytics for user ${user.id} for last ${days} days`);

    // Get analytics summary for the last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics_summary')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (analyticsError) {
      throw analyticsError;
    }

    // Get recent violations
    const { data: violations, error: violationsError } = await supabase
      .from('violations')
      .select('*')
      .eq('user_id', user.id)
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (violationsError) {
      throw violationsError;
    }

    // Get recent detections
    const { data: detections, error: detectionsError } = await supabase
      .from('detections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (detectionsError) {
      throw detectionsError;
    }

    // Calculate totals
    const totals = analytics?.reduce((acc, day) => ({
      total_detections: acc.total_detections + (day.total_detections || 0),
      compliant_count: acc.compliant_count + (day.compliant_count || 0),
      violation_count: acc.violation_count + (day.violation_count || 0),
      partial_count: acc.partial_count + (day.partial_count || 0),
    }), { total_detections: 0, compliant_count: 0, violation_count: 0, partial_count: 0 }) || 
    { total_detections: 0, compliant_count: 0, violation_count: 0, partial_count: 0 };

    const complianceRate = totals.total_detections > 0 
      ? ((totals.compliant_count / totals.total_detections) * 100).toFixed(1)
      : '0.0';

    return new Response(
      JSON.stringify({
        analytics: analytics || [],
        violations: violations || [],
        detections: detections || [],
        summary: {
          ...totals,
          compliance_rate: parseFloat(complianceRate),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analytics error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});