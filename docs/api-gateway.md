## API Gateway

NestJS application exposing authentication, users, and organizations APIs. All routes are protected by JWT and role-based access control unless stated otherwise.

Base URL: `/`

### Authentication

- POST `/auth/login`
  - Body:
    ```json
    { "email": "user@example.com", "password": "secret1234" }
    ```
  - Response:
    ```json
    {
      "access_token": "<jwt>",
      "user": { "id": "uuid", "email": "user@example.com", "firstName": "John", "lastName": "Doe", "role": "USER" }
    }
    ```

### Users

Requires `Authorization: Bearer <token>`.

- POST `/users` (roles: ADMIN)
  - Body (`UserInboundCreateDto`):
    ```json
    {
      "email": "user@example.com",
      "password": "secret1234",
      "firstName": "John",
      "lastName": "Doe"
    }
    ```
  - Response: `UserInboundProperties` without password

- GET `/users` (roles: ADMIN, OPERATOR)
  - Response: `UserInboundProperties[]`

- GET `/users/:id` (roles: ADMIN, OPERATOR)
  - Response: `UserInboundProperties`

- PATCH `/users/:id` (roles: ADMIN)
  - Body (`UserInboundDto` - partial of properties)
  - Response: updated `UserInboundProperties`

- DELETE `/users/:id` (roles: ADMIN)
  - Response: deleted `UserInboundProperties`

User DTOs:
```ts
// Selected fields
class UserInboundProperties {
  id: string; email: string; firstName: string; lastName: string; role: UserRole; createdAt: Date; updatedAt: Date; // password excluded
}
class UserInboundCreateDto { email: string; password: string; firstName: string; lastName: string }
type UserInboundDto = Partial<UserInboundProperties>
```

### Organizations

Requires `Authorization: Bearer <token>`.

- POST `/organizations` (roles: ADMIN)
  - Body (`OrganizationInboundCreateDto`):
    ```json
    { "name": "EcoWatch Org", "address": "1 Green Way" }
    ```
  - Side effects: creates an InfluxDB bucket via `InfluxDBBucketService` and persists bucket metadata on the organization

- GET `/organizations` (roles: ADMIN, OPERATOR)
  - Response: `OrganizationInboundProperties[]` including memberships and users

- GET `/organizations/:id` (roles: ADMIN, OPERATOR)

- GET `/organizations/:id/members` (roles: ADMIN, OPERATOR)
  - Response: array of users with role and joinedAt

- PATCH `/organizations/:id` (roles: ADMIN)
  - Body: `OrganizationInboundDto` (partial)

- DELETE `/organizations/:id` (roles: ADMIN)

Organization DTOs:
```ts
class OrganizationInboundProperties {
  id: string; name: string; address?: string; createdAt: Date; updatedAt: Date; memberships?: (OrganizationMembership & { user: User })[]
}
class OrganizationInboundCreateDto { name: string; address?: string }
type OrganizationInboundDto = Partial<Omit<OrganizationInboundProperties, 'memberships' | 'createdAt' | 'updatedAt'>>
```

### Auth & Security

- JWT signed via `AuthService` with payload: `{ sub, email, role }`
- Guards: `JwtAuthGuard`, `RolesGuard`; decorator `@Roles(...roles)`

### Quick Start

```bash
curl -sS -X POST http://localhost:3000/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@example.com","password":"secret1234"}'

TOKEN=... # set from response

curl -sS -H "authorization: Bearer $TOKEN" http://localhost:3000/users
```

