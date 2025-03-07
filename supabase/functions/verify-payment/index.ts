
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
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Verifying payment with reference:', reference)
    
    const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY')
    
    if (!PAYSTACK_SECRET) {
      console.error('Paystack secret key not found')
      return new Response(
        JSON.stringify({ error: 'Payment provider configuration missing' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    
    console.log('Paystack verification response:', data)
    
    if (!data.status) {
      console.error('Paystack verification error:', data)
      return new Response(
        JSON.stringify({ error: data.message || 'Payment verification failed', success: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Extract metadata from the payment response
    const { metadata } = data.data
    const { userId, eventId, ticketTypeId, organizerId, eventTitle, ticketType } = metadata
    const amount = data.data.amount / 100 // Convert from cents to currency units
    
    console.log('Extracted metadata:', { userId, eventId, ticketTypeId, organizerId, amount })
    
    // Initialize Supabase client for processing
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Check if we've already processed this payment reference
    const { data: existingTransaction } = await supabase
      .from('payment_transactions')
      .select('id, status')
      .eq('payment_reference', reference)
      .maybeSingle()
      
    if (existingTransaction?.status === 'completed') {
      console.log('Payment already processed:', existingTransaction)
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'completed',
          message: 'Payment already processed'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Handle verified payment processing
    if (data.data.status === 'success') {
      console.log('Payment successful, creating ticket')
      
      // Verify ticket type still exists and has availability
      const { data: ticketTypeData, error: ticketTypeError } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('id', ticketTypeId)
        .single()
        
      if (ticketTypeError) {
        console.error('Error fetching ticket type:', ticketTypeError)
        return new Response(
          JSON.stringify({ error: 'Ticket type no longer available', success: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (ticketTypeData.sold >= ticketTypeData.quantity) {
        console.error('Tickets sold out')
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Tickets sold out',
            message: 'Tickets for this event have been sold out' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
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
          JSON.stringify({ error: ticketError.message, success: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('Ticket created:', ticketData)
      
      // Increment the sold count for the ticket type
      const { error: updateError } = await supabase
        .from('ticket_types')
        .update({ sold: ticketTypeData.sold + 1 })
        .eq('id', ticketTypeId)
        
      if (updateError) {
        console.error('Error updating ticket type:', updateError)
      }
      
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
      } else {
        console.log('Transaction created:', transactionData)
      }
      
      // Update organizer wallet balance
      const { error: walletError } = await supabase.rpc('update_organizer_balance', { 
        p_organizer_id: organizerId,
        p_amount: amount
      })
      
      if (walletError) {
        console.error('Error updating organizer balance:', walletError)
      } else {
        console.log('Organizer balance updated')
      }
      
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
      console.log('Payment not completed, status:', data.data.status)
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
      JSON.stringify({ error: error.message, success: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
