import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { PrismaModule } from "../../service/prisma/prisma.module";


@Module({
    imports: [PrismaModule],
    exports: [UsersService],
})
export class UsersModule { }