import { BaseEntity, Column, Entity, ObjectIdColumn } from "typeorm";
import typeorm from "typeorm";
const { ObjectID } = typeorm;

@Entity("users")
export class UserPermission extends BaseEntity {

    @ObjectIdColumn()
    _id: typeof ObjectID;
    
    @Column("text")
    public userID: string;

}