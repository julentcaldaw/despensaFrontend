
# desPENSA Frontend

Aplicación web para la gestión de despensa, lista de la compra y sugerencias de recetas, orientada a usuarios domésticos y familias. Permite escanear productos, controlar el stock, planificar compras y descubrir recetas según los ingredientes disponibles.

## Características principales

- Gestión de productos en la despensa (alta, baja, edición, caducidad)
- Escaneo de productos mediante código de barras
- Generación y gestión de lista de la compra
- Sugerencias de recetas personalizadas
- Interfaz adaptada a móvil (Mobile-First)
- Acceso y comportamiento según rol de usuario

## Stack tecnológico

- **React** + **TypeScript**
- **Vite** (entorno de desarrollo y build)
- **Tailwind CSS v4** + **daisyUI** (UI y componentes)
- **Lucide React** (iconografía)
- **React Query** (gestión de datos remotos)
- **React Router** (navegación)

## Instalación y uso

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/despensaFrontend.git
   cd despensaFrontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Accede a la app en [http://localhost:5173](http://localhost:5173)

### Scripts útiles

- `npm run dev` — Inicia el servidor de desarrollo
- `npm run build` — Genera la build de producción
- `npm run preview` — Previsualiza la build
- `npm run lint` — Linting del código

## Estructura de carpetas

```
src/
  app/                # App shell y layout
  assets/             # Imágenes y recursos estáticos
  entities/           # Componentes de dominio (despensa, recetas...)
  features/           # Lógica de negocio por dominio
  pages/              # Páginas principales
  shared/             # Utilidades, tipos y UI compartida
public/               # Archivos estáticos
docs/                 # Documentación y convenciones
```

## Estilo y accesibilidad

- Diseño Mobile-First y centrado en el usuario
- Paleta de colores fresca y limpia (ver docs/ui/design-system.md)
- Tipografía sans-serif (Inter, Roboto)
- Iconos vectoriales consistentes (Lucide)
- Accesibilidad: áreas táctiles grandes, contraste AA, feedback inmediato

## Créditos y referencias

- [Tailwind CSS](https://tailwindcss.com/)
- [daisyUI](https://daisyui.com/)
- [Lucide React](https://lucide.dev/)
- [React Query](https://tanstack.com/query/latest)
- [React Router](https://reactrouter.com/)

---
Para más detalles sobre arquitectura y convenciones, consulta la carpeta `docs/`.
