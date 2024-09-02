
import { AfterLoad,PrimaryGeneratedColumn, BaseEntity, BeforeInsert, BeforeUpdate, Column, DeleteDateColumn, getCustomRepository, ManyToOne } from "typeorm";
import { StatusEnum } from "./status.enum";


export class DefaultEntity extends BaseEntity {
   
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: StatusEnum,
        default: StatusEnum.IS_ACTIVE
    })
    status: StatusEnum;

    @Column({ default: () => "CURRENT_TIMESTAMP" })
    created_at: string;

    @Column({ nullable: true })
    created_by: number;

    @Column({ default: () => "CURRENT_TIMESTAMP" })
    updated_at: string;

    @Column({ nullable: true })
    updated_by: number;

    @Column({ default: false })
    is_deleted: boolean;

    @BeforeUpdate()
    updateTimestamp() {
        this.updated_at = (new Date).toISOString();
    }

    @BeforeInsert()
    utcTimestamp() {
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();
    }

    @AfterLoad()
    timestampformat() {
        this.created_at = new Date(this.created_at).toLocaleString('en-US');
        this.updated_at = new Date(this.updated_at).toLocaleString('en-US');
    }

}
