
DROP TABLE public.messages
CREATE TABLE IF NOT EXISTS public.messages(
    id SERIAL PRIMARY KEY NOT NULL,
    channel_id number NOT NULL,
    sender_id integer NOT NULL,
    sender_name character varying(50) NOT NULL DEFAULT '',
    sender_avatar character varying(250) NOT NULL DEFAULT '',
    sequence integer NOT NULL DEFAULT 0,
    message_type integer NOT NULL DEFAULT 0,
    message text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);