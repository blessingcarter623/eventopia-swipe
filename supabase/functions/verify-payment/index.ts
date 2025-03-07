
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import { corsHeaders } from '../_shared/cors.ts'

interface VerifyPaymentPayload {
  reference: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const { reference } = await req.json() as VerifyPaymentPayload
    
    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Missing payment reference' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY')
    
    if (!PAYSTACK_SECRET) {
      console.error('Paystack secret key not found')
      return new Response(
        JSON.stringify({ error: 'Payment provider configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      }
    })
    
    const data = await response.json()
    
    if (!data.status) {
      console.error('Paystack verification error:', data)
      return new Response(
        JSON.stringify({ error: data.message || 'Payment verification failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Extract metadata from the payment response
    const { metadata } = data.data
    const { userId, eventId, ticketTypeId, organizerId, eventTitle, ticketType } = metadata
    const amount = data.data.amount / 100 // Convert from kobo/cents
    
    // Initialize Supabase client for processing
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Handle verified payment processing
    if (data.data.status === 'success') {
      // Create a ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          event_id: eventId,
          ticket_type_id: ticketTypeId,
          user_id: userId,
          price: amount,
          status: 'active',
          qr_code: crypto.randomUUID()
        })
        .select()
        .single()
        
      if (ticketError) {
        console.error('Error creating ticket:', ticketError)
        return new Response(
          JSON.stringify({ error: ticketError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Increment the sold count for the ticket type
      await supabase
        .from('ticket_types')
        .update({ sold: supabase.rpc('increment', { inc: 1 }) })
        .eq('id', ticketTypeId)
      
      // Create transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          ticket_id: ticketData.id,
          event_id: eventId,
          buyer_id: userId,
          organizer_id: organizerId,
          amount: amount,
          payment_reference: reference,
          status: 'completed'
        })
        .select()
      
      if (transactionError) {
        console.error('Error creating transaction:', transactionError)
      }
      
      // Update organizer wallet balance
      await supabase.rpc('update_organizer_balance', { 
        p_organizer_id: organizerId,
        p_amount: amount
      })
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'completed',
          ticket: ticketData,
          transaction: transactionData
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Handle failed or pending payments
      return new Response(
        JSON.stringify({ 
          success: false, 
          status: data.data.status,
          message: 'Payment not completed'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
  } catch (error) {
    console.error('Verify payment error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
