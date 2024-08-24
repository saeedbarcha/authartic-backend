import { Entity, Column } from 'typeorm';
import { DefaultEntity } from 'src/modules/common/default.entity';


@Entity()
export class Attachment extends DefaultEntity {

    @Column()
    file_name: string;

    @Column()
    path: string;

    @Column({ name: 'mime_type' })
    mimeType: string;

    @Column()
    size: number;

    @Column({ nullable: true })
    url?: string;

    @Column({ nullable: true, name: 'file_type' })
    file_type?: string;

}
