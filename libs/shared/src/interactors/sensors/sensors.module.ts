import { Module } from "@nestjs/common";
import { SensorsService } from "./sensors.service";
import { PrismaModule } from "../../service/prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    providers: [SensorsService],
    exports: [SensorsService],
})
export class SensorsModule { }