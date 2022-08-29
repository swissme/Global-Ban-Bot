import { BaseEntity, Column, Entity, ObjectIdColumn } from "typeorm";
import typeorm from "typeorm";
const { ObjectID } = typeorm;

@Entity("bans")
export class Ban extends BaseEntity {

    @ObjectIdColumn()
    _id: typeof ObjectID;
    
    @Column("text")
    public victim: string;

    @Column("text")
    public issuer: string;
    
    @Column("text")
    public reason: string;

    @Column("test")
    public createdAt: Date;

}