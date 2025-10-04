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

    const settings = await req.json();
    console.log('Updating settings for user:', user.id, settings);

    // Check if settings exist
    const { data: existing } = await supabase
      .from('user_settings')
      .select()
      .eq('user_id', user.id)
      .single();

    let result;
    
    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          confidence_threshold: settings.confidence_threshold,
          enabled_ppe_types: settings.enabled_ppe_types,
          auto_alert: settings.auto_alert,
          save_snapshots: settings.save_snapshots,
          show_bboxes: settings.show_bboxes,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          confidence_threshold: settings.confidence_threshold,
          enabled_ppe_types: settings.enabled_ppe_types,
          auto_alert: settings.auto_alert,
          save_snapshots: settings.save_snapshots,
          show_bboxes: settings.show_bboxes,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return new Response(
      JSON.stringify({ success: true, settings: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Settings update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
