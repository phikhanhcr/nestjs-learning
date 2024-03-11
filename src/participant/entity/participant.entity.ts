import { Channel, IKeyChannel, ILastMessage } from 'src/channel/entity/channel.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    ManyToOne,
    ObjectIdColumn,
} from 'typeorm';
import { ObjectId } from 'bson';

export interface IParticipant {
    id: number;
    user_id: number;
    channel_id: number;
    channel_key: IKeyChannel;
    channel_name: string;
    channel_avatar: string;
    last_seen: number;
    last_sequence: number;
    last_active_at: Date;
    unread_count: number;
    other_last_seen: number;
    last_message: ILastMessage;
    created_at: Date;
    updated_at: Date;
}

@Entity({
    name: 'participants',
})
export class Participant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'user_id',
        nullable: false,
    })
    userId: number;

    @Column({
        name: 'channel_id',
        nullable: false,
        type: 'integer',
    })
    channelId: number;

    @ObjectIdColumn()
    @Column({
        type: 'bytea',
        nullable: true,
        name: 'channel_key',
    })
    channelKey: IKeyChannel;

    @Column({
        name: 'channel_name',
        nullable: false,
    })
    channelName: string;

    @Column({
        name: 'channel_avatar',
        nullable: false,
    })
    channelAvatar: string;

    @Column({
        name: 'last_seen',
        nullable: false,
    })
    lastSeen: number;

    @Column({
        name: 'last_sequence',
        nullable: false,
        default: 0,
    })
    lastSequence: number;

    @Column({
        name: 'last_active_at',
        nullable: true,
        type: 'timestamp with time zone',
    })
    lastActiveAt: Date;

    @Column({
        name: 'unread_count',
        nullable: false,
        default: 0,
    })
    unReadCount: number;

    @Column({
        name: 'other_last_seen',
        nullable: false,
        default: 0,
    })
    otherLastSeen: number;

    @Column({
        type: 'json',
        nullable: true,
        default: null,
        name: 'last_message',
    })
    lastMessage: ILastMessage;

    // @ManyToOne(() => Channel)
    // @JoinColumn()
    // channel: Channel;

    @ManyToOne(() => Channel, (channel) => channel.participants)
    @JoinColumn({ name: 'channel_id', referencedColumnName: 'id' })
    channel: Channel;

    @CreateDateColumn({
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP',
        type: 'timestamp with time zone',
    })
    createdAt: Date;

    @UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        type: 'timestamp with time zone',
        name: 'updated_at',
    })
    updatedAt: Date;
}
