-- Geri arama talepleri tablosu
CREATE TABLE IF NOT EXISTS callback_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'called', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  called_at TIMESTAMP WITH TIME ZONE
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_callback_requests_status ON callback_requests(status);
CREATE INDEX IF NOT EXISTS idx_callback_requests_created_at ON callback_requests(created_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_callback_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_callback_requests_updated_at
    BEFORE UPDATE ON callback_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_callback_requests_updated_at(); 