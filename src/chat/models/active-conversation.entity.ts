import { UserEntity } from 'src/auth/models/user.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('active-conversation')
export class ActiveConversationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  socketId: string;

  @Column()
  userId: number;

  @Column()
  conversationId: number;
}
