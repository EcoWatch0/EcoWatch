import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { UsersService } from '@ecowatch/shared';
import { UserRole } from '@prisma/client';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let usersService: UsersService;

  beforeEach(() => {
    usersService = new (class implements Partial<UsersService> {
      create = jest.fn();
      findMany = jest.fn();
      findOne = jest.fn();
      update = jest.fn();
      delete = jest.fn();
    })() as any;
    service = new UserService(usersService as any);
  });

  it('create -> should hash password and set default role USER', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (usersService.create as any).mockResolvedValue({ id: 'u1', email: 'a@a.com', role: UserRole.USER });
    const result = await service.create({ email: 'a@a.com', password: 'pwd' } as any);
    expect(bcrypt.hash).toHaveBeenCalledWith('pwd', 10);
    expect(usersService.create).toHaveBeenCalledWith({
      data: { email: 'a@a.com', password: 'hashed', role: UserRole.USER },
    });
    expect(result).toMatchObject({ id: 'u1', email: 'a@a.com', role: UserRole.USER });
  });

  it('create -> should throw if password missing', async () => {
    await expect(service.create({ email: 'a@a.com' } as any)).rejects.toThrow('Password is required');
  });

  it('findAll -> should list only USER role', async () => {
    (usersService.findMany as any).mockResolvedValue([{ id: 'u1', role: UserRole.USER }]);
    const result = await service.findAll();
    expect(usersService.findMany).toHaveBeenCalledWith({ where: { role: UserRole.USER } });
    expect(result).toHaveLength(1);
  });

  it('findOne -> throws when not found', async () => {
    (usersService.findOne as any).mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update -> hashes password when provided', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('newhash');
    (usersService.update as any).mockResolvedValue({ id: 'u1' });
    const result = await service.update('u1', { password: 'new' } as any);
    expect(bcrypt.hash).toHaveBeenCalledWith('new', 10);
    expect(usersService.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { password: 'newhash' } });
    expect(result).toMatchObject({ id: 'u1' });
  });

  it('remove -> deletes after existence check', async () => {
    (usersService.findOne as any).mockResolvedValue({ id: 'u1' });
    (usersService.delete as any).mockResolvedValue({ id: 'u1' });
    const result = await service.remove('u1');
    expect(usersService.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(result).toMatchObject({ id: 'u1' });
  });
});


