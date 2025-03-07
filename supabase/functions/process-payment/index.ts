
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import { corsHeaders } from '../_shared/cors.ts'

interface PaymentPayload {
  amount: number
  email: string
  eventId: string
  ticketTypeId: string
  userId: string
  callbackUrl: string
  metadata: {
    eventTitle: string
    ticketType: string
    organizerId: string
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const { amount, email, eventId, ticketTypeId, userId, callbackUrl, metadata } = await req.json() as PaymentPayload
    
    if (!amount || !email || !eventId || !ticketTypeId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // For free tickets, create ticket directly without payment
    if (amount === 0) {
      // Create a ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          event_id: eventId,
          ticket_type_id: ticketTypeId,
          user_id: userId,
          price: 0,
          status: 'active',
          qr_code: crypto.randomUUID()
        })
        .select()
        .single()
        
      if (ticketError) {
        console.error('Error creating free ticket:', ticketError)
        return new Response(
          JSON.stringify({ error: ticketError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Create transaction record
      await supabase
        .from('payment_transactions')
        .insert({
          ticket_id: ticketData.id,
          event_id: eventId,
          buyer_id: userId,
          organizer_id: metadata.organizerId,
          amount: 0,
          status: 'completed',
          is_free: true
        })
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          ticket: ticketData,
          redirectUrl: callbackUrl
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // For paid tickets, initialize Paystack payment
    const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY')
    
    if (!PAYSTACK_SECRET) {
      console.error('Paystack secret key not found')
      return new Response(
        JSON.stringify({ error: 'Payment provider configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Initialize Paystack payment
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to kobo/cents
        email,
        callback_url: callbackUrl,
        metadata: {
          ...metadata,
          userId,
          eventId,
          ticketTypeId
        }
      })
    })
    
    const data = await response.json()
    
    if (!data.status) {
      console.error('Paystack error:', data)
      return new Response(
        JSON.stringify({ error: data.message || 'Payment initialization failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ success: true, paymentUrl: data.data.authorization_url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Process payment error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
