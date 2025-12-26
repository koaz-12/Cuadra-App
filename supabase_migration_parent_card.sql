alter table credit_cards 
add column parent_card_id uuid references credit_cards(id) on delete set null;

comment on column credit_cards.parent_card_id is 'Reference to the primary card if this is a secondary currency card (Dual Currency)';
