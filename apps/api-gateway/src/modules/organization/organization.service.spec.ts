import { NotFoundException } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganisationsService, InfluxDBBucketService } from '@ecowatch/shared';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let organisationsService: OrganisationsService;
  let influxDBBucketService: InfluxDBBucketService;

  beforeEach(() => {
    // Using mapped mock via paths; but instantiate plain objects to avoid constructor requirements
    organisationsService = ({
      create: jest.fn(),
      findMany: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown) as OrganisationsService;
    influxDBBucketService = ({
      createBucketForOrganization: jest.fn(),
    } as unknown) as InfluxDBBucketService;
    service = new OrganizationService(
      organisationsService as any,
      influxDBBucketService as any,
    );
  });

  it('create -> should create organization and create bucket then return hydrated entity', async () => {
    const created = { id: 'org-1' } as any;
    const hydrated = { id: 'org-1', name: 'ACME', memberships: [] } as any;
    (organisationsService.create as any).mockResolvedValue(created);
    (influxDBBucketService.createBucketForOrganization as any).mockResolvedValue(undefined);
    (organisationsService.findOne as any).mockResolvedValue(hydrated);

    const result = await service.create({ name: 'ACME' } as any);
    expect(organisationsService.create).toHaveBeenCalledWith({ data: { name: 'ACME' } });
    expect(influxDBBucketService.createBucketForOrganization).toHaveBeenCalledWith('org-1');
    expect(organisationsService.findOne).toHaveBeenCalledWith({ where: { id: 'org-1' } });
    expect(result).toMatchObject(hydrated);
  });

  it('findAll -> should return list as instances', async () => {
    (organisationsService.findMany as any).mockResolvedValue([{ id: '1' }, { id: '2' }]);
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('findOne -> should throw if not found', async () => {
    (organisationsService.findOne as any).mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update -> should update after existence check', async () => {
    (organisationsService.findOne as any).mockResolvedValue({ id: '1' });
    (organisationsService.update as any).mockResolvedValue({ id: '1', name: 'N' });
    const result = await service.update('1', { name: 'N' } as any);
    expect(organisationsService.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { name: 'N' } });
    expect(result).toMatchObject({ id: '1', name: 'N' });
  });

  it('remove -> should delete after existence check', async () => {
    (organisationsService.findOne as any).mockResolvedValue({ id: '1' });
    (organisationsService.delete as any).mockResolvedValue({ id: '1' });
    const result = await service.remove('1');
    expect(organisationsService.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toMatchObject({ id: '1' });
  });

  it('getMembers -> should map memberships to users with role and joinedAt', async () => {
    (organisationsService.findOne as any).mockResolvedValue({
      id: '1',
      memberships: [
        { role: 'ADMIN', joinedAt: '2020-01-01', user: { id: 'u1', email: 'a@a.com' } },
      ],
    });
    const result = await service.getMembers('1');
    expect(result[0]).toMatchObject({ id: 'u1', email: 'a@a.com', role: 'ADMIN', joinedAt: '2020-01-01' });
  });
});


