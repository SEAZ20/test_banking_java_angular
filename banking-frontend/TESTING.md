# Testing con Jest - Banking Frontend

## Configuración

El proyecto está configurado con Jest para testing unitario. Se han creado pruebas para los servicios y componentes principales.

## Instalación

Para instalar Jest y las dependencias necesarias:

```bash
chmod +x setup-jest.sh
./setup-jest.sh
```

O manualmente:

```bash
# Remover Karma y Jasmine (si están instalados)
npm uninstall karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter @types/jasmine jasmine-core

# Instalar Jest
npm install --save-dev jest @types/jest jest-preset-angular
```

## Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (útil durante desarrollo)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

## Estructura de Tests

### Servicios
- **client.service.spec.ts** - Tests para ClientService
  - ✅ GET todos los clientes
  - ✅ GET cliente por ID
  - ✅ POST crear cliente
  - ✅ PUT actualizar cliente
  - ✅ DELETE eliminar cliente

- **account.service.spec.ts** - Tests para AccountService
  - ✅ GET todas las cuentas
  - ✅ POST crear cuenta
  - ✅ DELETE eliminar cuenta

- **movement.service.spec.ts** - Tests para MovementService
  - ✅ GET todos los movimientos
  - ✅ POST crear movimiento

### Componentes
- **clients.component.spec.ts** - Tests para ClientsComponent
  - ✅ Cargar clientes al inicializar
  - ✅ Filtrar clientes por nombre
  - ✅ Filtrar clientes por identificación
  - ✅ Abrir modal de creación
  - ✅ Abrir modal de edición
  - ✅ Cerrar modal
  - ✅ Crear nuevo cliente
  - ✅ Manejar errores de validación
  - ✅ Eliminar cliente
  - ✅ Extraer mensajes de error

## Cobertura

El proyecto está configurado para generar reportes de cobertura en:
- `coverage/index.html` - Reporte HTML
- `coverage/lcov.info` - Formato LCOV
- Terminal - Resumen de cobertura

Los siguientes archivos están excluidos del reporte de cobertura:
- Archivos de configuración (*.module.ts, main.ts, etc.)
- Archivos de rutas (app.routes.ts)
- node_modules y dist

## Archivos de Configuración

- **jest.config.js** - Configuración principal de Jest
- **setup-jest.ts** - Archivo de setup para Jest con Angular
- **tsconfig.spec.json** - Configuración de TypeScript para tests

## Buenas Prácticas

1. **Nombrar archivos**: `*.spec.ts`
2. **Usar describe/it**: Estructura clara de tests
3. **Mock de servicios**: Usar `jest.fn()` para mockear
4. **BeforeEach/AfterEach**: Configurar y limpiar cada test
5. **HttpTestingController**: Para tests de servicios HTTP
6. **TestBed**: Para tests de componentes Angular

## Ejemplo de Test

```typescript
describe('ClientService', () => {
  let service: ClientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClientService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all clients', () => {
    const mockClients = [/* mock data */];

    service.getAllClients().subscribe(clients => {
      expect(clients.length).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:8080/clients');
    expect(req.request.method).toBe('GET');
    req.flush(mockClients);
  });
});
```

## Agregar Más Tests

Para agregar tests a otros componentes:

1. Crear archivo `*.spec.ts` junto al componente
2. Importar dependencias necesarias
3. Configurar TestBed
4. Mockear servicios si es necesario
5. Escribir tests siguiendo el patrón AAA (Arrange, Act, Assert)

## CI/CD

Los tests se pueden integrar fácilmente en pipelines de CI/CD:

```yaml
# Ejemplo GitHub Actions
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage
```
