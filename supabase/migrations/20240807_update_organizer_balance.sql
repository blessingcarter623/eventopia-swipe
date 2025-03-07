
-- Function to update organizer balance
CREATE OR REPLACE FUNCTION update_organizer_balance(p_organizer_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE organizer_wallets
  SET 
    balance = balance + p_amount,
    last_updated = now()
  WHERE organizer_id = p_organizer_id;
END;
$$ LANGUAGE plpgsql;
