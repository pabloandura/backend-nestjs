# Backend NestJS

Hola! Gracias por revisar el código.

## Qué pedía el challenge

NestJS + MongoDB + JWT, endpoints de Products y Orders con paginación, filtros, ordenamiento, file upload para la imagen del producto, y como bonus dockerizar todo.

## Todo está cubierto — con algunas decisiones de diseño

### MongoDB y PostgreSQL conviviendo

El challenge pedía MongoDB con `@nestjs/mongoose`. Products y Orders están en MongoDB, tal cual. Pero para Auth decidí usar PostgreSQL.

¿Por qué? Porque Auth maneja usuarios y refresh tokens, y ahí necesitás integridad relacional: un `UNIQUE` en el email, una FK de `refresh_tokens → users`, y rotación atómica de tokens. MongoDB puede hacer todo eso, pero PostgreSQL es la herramienta que mejor se adapta a ese modelo. 

### Refresh tokens además del JWT

El challenge pedía JWT como estrategia de autenticación. Eso está: el `JwtAuthGuard` protege todos los endpoints. Lo que agregué encima es rotación de refresh tokens — básicamente, el access token dura 15 minutos y el refresh token 7 días, con rotación en cada uso.


### Los line items de una orden son snapshots

El challenge dice "lista de productos". Podría haber guardado solo los IDs, pero guardé un snapshot del producto al momento de la compra: nombre, SKU, precio, subtotal.

¿Por qué? Porque si el precio de un producto cambia mañana, los pedidos históricos no deberían verse afectados. Es el comportamiento correcto en cualquier sistema de e-commerce.

### El campo "picture" se guarda como `imageUrl`

El upload es multipart, tal como lo pide el challenge. Lo que se persiste en MongoDB es la URL del archivo (en disco local o en S3, según el `STORAGE_DRIVER`). El campo se llama `imageUrl` porque eso es lo que es — una referencia, no el binario en sí.

### Roles de usuario

El challenge no los mencionaba, pero los agregué igual. Sin algún tipo de RBAC, cualquier usuario registrado podría borrar productos o ver los reportes de ventas. No parecía razonable dejarlo así.

### El bonus de Docker y algo más

El bonus pedía dockerizar MongoDB y la API. Eso está en `docker-compose.dev.yml` y `docker-compose.prod.yml`. De yapa, hay stacks de CloudFormation para deployar todo en AWS (VPC, ECS, RDS, DocumentDB, S3, ALB) y un frontend en React para que se pueda ver la API funcionando en contexto real.

---

## Cómo levantarlo

Lo más fácil es desde la raíz del superproyecto:

```bash
git clone --recurse-submodules https://github.com/pabloandura/an-enterprise-nestjs-example.git
cd an-enterprise-nestjs-example
cp .env.example .env   # completar JWT_SECRET mínimamente
docker compose -f docker-compose.dev.yml up --build
```

Si ya clonaste sin el flag, inicializá los submódulos antes:

```bash
git submodule update --init --recursive
```

La API queda en `http://localhost:3000`. El detalle completo de variables de entorno, endpoints y arquitectura está en el [README del superproyecto](https://github.com/pabloandura/an-enterprise-nestjs-example).
