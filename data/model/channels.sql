
DROP TABLE public.channels 
CREATE TABLE IF NOT EXISTS public.channels (
    id SERIAL PRIMARY KEY NOT NULL,
    key bytea NOT NULL,
    key_channel jsonb NOT NULL DEFAULT '{}',
    last_message jsonb NULL DEFAULT '{}',
    last_sequence integer NOT NULL DEFAULT 0,
    participants jsonb NOT NULL DEFAULT '[]',
    channel_type SMALLINT NOT NULL DEFAULT 1,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);


DROP TABLE public.participants 
CREATE TABLE IF NOT EXISTS public.participants (
    id SERIAL PRIMARY KEY NOT NULL,
    user_id integer NOT NULL,
    channel_id integer NOT NULL,
    channel_key jsonb NOT NULL DEFAULT '{}',
    channel_name character varying(50) NOT NULL DEFAULT '',
    channel_avatar character varying(250) NOT NULL DEFAULT '',
    last_seen integer NULL DEFAULT NULL,
    last_message jsonb NULL DEFAULT '{}',
    last_sequence integer NOT NULL DEFAULT 0,
    last_active_at timestamp with time zone NULL DEFAULT NULL,
    unread_count integer NOT NULL DEFAULT 0,
    other_last_seen integer NULL DEFAULT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS last_message jsonb NULL DEFAULT '{}';