import { Channel } from 'src/channel/entities/channel.entity';
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

    @ObjectIdColumn()
    @Column({
        name: 'channel_id',
        nullable: false,
        type: 'bytea',
    })
    channelId: ObjectId;

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

    @ManyToOne(() => Channel)
    @JoinColumn()
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
