import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, IsDate } from 'class-validator';
import { PartialType } from '@nestjs/swagger';


export class UserInboundProperties {
    @Expose()
    @IsString()
    @IsNotEmpty()
    id: string;
  
    @Expose()
    @IsEmail()
    @IsNotEmpty()
    email: string;
  
    @Expose()
    @IsString()
    @IsNotEmpty()
    firstName: string;
  
    @Expose()
    @IsString()
    @IsNotEmpty()
    lastName: string;
  
    @Expose()
    @IsEnum(UserRole)
    role: UserRole;
  
    @Expose()
    @IsDate()
    @IsNotEmpty()
    createdAt: Date;
  
    @Expose()
    @IsDate()
    @IsNotEmpty()
    updatedAt: Date;
  
    @Exclude()
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class UserInboundDto extends PartialType(UserInboundProperties) {}

export class UserInboundCreateDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;
}

export class UserInboundUpdateDto extends UserInboundDto {} 