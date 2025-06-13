import { Module } from "@nestjs/common";
import { OrganisationsService } from "./organisations.service";
import { PrismaModule } from "../../service/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    providers: [OrganisationsService],
    exports: [OrganisationsService],
})
export class OrganisationsModule { }