/// <reference types="cypress" />

describe('Página de Informes', () => {
  beforeEach(() => {
    // Simular login y visitar la página
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'token-falso-valido');
        win.localStorage.setItem('user', JSON.stringify({
          rolId: 1,
          rol: "Administrador",
          nombre: "Admin",
          email: "admin@correo.com"
        }));
      }
    });

    // Visitar la página de informes
         cy.visit('/informes', {
      timeout: 20000, // Aumentar timeout
      failOnStatusCode: false
         });
    
    // Esperar a que la página se cargue completamente
           cy.get('h2.informe-title', { timeout: 20000 }).should('be.visible');
  });

  it('Debe mostrar la estructura básica de la página de informes', () => {
    // Verificar elementos principales
    cy.get('img[alt="Logo de la farmacia"]').should('be.visible');
    cy.get('button[aria-label="Cerrar sesión"]').should('be.visible');
    cy.get('h2.informe-title').should('contain', 'Informes');
    
    // Verificar que existen las pestañas
    cy.get('#informes-tabs').should('be.visible');
    cy.get('#informes-tabs .nav-link').should('have.length', 4);
    cy.get('#informes-tabs .nav-link').eq(0).should('contain', 'Informes de Productos');
    cy.get('#informes-tabs .nav-link').eq(1).should('contain', 'Informes de Movimientos');
    cy.get('#informes-tabs .nav-link').eq(2).should('contain', 'Informes de Proveedores');
    cy.get('#informes-tabs .nav-link').eq(3).should('contain', 'Informes de Usuarios');
  });

  describe('Pestaña de Productos', () => {
    beforeEach(() => {
      // Asegurarse de que estamos en la pestaña de productos
      cy.get('#informes-tabs .nav-link').contains('Informes de Productos').click();
    });

    it('Debe mostrar el formulario de informe de productos', () => {
      cy.get('form').should('exist');
      cy.get('#formProductReportType').should('exist');
      cy.get('#formProductReportType option').should('have.length', 4);
      cy.get('#formProductReportType option').eq(0).should('have.value', 'todos');
      cy.get('#formProductReportType option').eq(1).should('have.value', 'vencer');
      cy.get('#formProductReportType option').eq(2).should('have.value', 'stock');
      cy.get('#formProductReportType option').eq(3).should('have.value', 'fecha-ingreso');
    });

    it('Debe mostrar campos de fecha cuando se selecciona "Productos por Fecha de Ingreso"', () => {
      cy.get('#formProductReportType').select('fecha-ingreso');
      cy.get('#formProductFechaInicio').should('be.visible');
      cy.get('#formProductFechaFin').should('be.visible');
    });

    it('Debe mostrar advertencia si fecha inicio es mayor que fecha fin', () => {
      cy.get('#formProductReportType').select('fecha-ingreso');
      cy.get('#formProductFechaInicio').type('2025-06-10');
      cy.get('#formProductFechaFin').type('2025-06-01');
      cy.get('.alert-warning').should('contain', 'La fecha de inicio es mayor que la fecha final');
    });
  });

  describe('Pestaña de Movimientos', () => {
    beforeEach(() => {
      cy.get('#informes-tabs .nav-link').contains('Informes de Movimientos').click();
    });

    it('Debe mostrar el formulario de informe de movimientos', () => {
      cy.get('form').should('exist');
      cy.get('#formMovementReportType').should('exist');
      cy.get('#formMovementReportType option').should('have.length', 5);
    });

    it('Debe mostrar campos de fecha cuando se selecciona "Movimientos por Fecha"', () => {
      cy.get('#formMovementReportType').select('fechas');
      cy.get('#formMovementFechaInicio').should('be.visible');
      cy.get('#formMovementFechaFin').should('be.visible');
    });

    it('Debe mostrar campo de ID de producto cuando se selecciona "Movimientos por Producto"', () => {
      cy.get('#formMovementReportType').select('porproducto');
      cy.get('#formProductoId').should('be.visible');
    });

    it('Debe mostrar campo de ID de usuario cuando se selecciona "Movimientos por Usuario"', () => {
      cy.get('#formMovementReportType').select('usuario');
      cy.get('#formUsuarioId').should('be.visible');
    });

    it('Debe mostrar selector de tipo de movimiento cuando se selecciona "Movimientos por Tipo"', () => {
      cy.get('#formMovementReportType').select('tipo');
      cy.get('#formTipoMovimiento').should('be.visible');
      cy.get('#formTipoMovimiento option').should('have.length', 4);
    });
  });

  describe('Pestaña de Proveedores', () => {
    beforeEach(() => {
      cy.get('#informes-tabs .nav-link').contains('Informes de Proveedores').click();
    });

    it('Debe mostrar el formulario de informe de proveedores', () => {
      cy.get('form').should('exist');
      cy.get('#formProviderReportType').should('exist');
      cy.get('#formProviderReportType option').should('have.length', 2);
    });

    it('Debe mostrar campo de ID de laboratorio cuando se selecciona "Informe de Laboratorio"', () => {
      cy.get('#formProviderReportType').select('laboratorio');
      cy.get('#formLaboratorioId').should('be.visible');
    });
  });

  describe('Pestaña de Usuarios', () => {
    beforeEach(() => {
      cy.get('#informes-tabs .nav-link').contains('Informes de Usuarios').click();
    });

    it('Debe mostrar el formulario de informe de usuarios', () => {
      cy.get('form').should('exist');
      cy.get('#formUserReportType').should('exist');
      cy.get('#formUserReportType option').should('have.length', 3);
    });

    it('Debe mostrar campo de ID de usuario cuando se selecciona "Usuario Específico"', () => {
      cy.get('#formUserReportType').select('usuario');
      cy.get('#formUserId').should('be.visible');
    });

    it('Debe mostrar campo de ID de rol cuando se selecciona "Usuarios por Rol"', () => {
      cy.get('#formUserReportType').select('rol');
      cy.get('#formRolId').should('be.visible');
    });
  });

  it('Debe permitir cambiar entre pestañas correctamente', () => {
    // Verificar que la pestaña de productos está activa por defecto
    cy.get('#informes-tabs .nav-link.active').should('contain', 'Informes de Productos');
    
    // Cambiar a pestaña de movimientos
    cy.get('#informes-tabs .nav-link').contains('Informes de Movimientos').click();
    cy.get('#informes-tabs .nav-link.active').should('contain', 'Informes de Movimientos');
    cy.get('#formMovementReportType').should('be.visible');
    
    // Cambiar a pestaña de proveedores
    cy.get('#informes-tabs .nav-link').contains('Informes de Proveedores').click();
    cy.get('#informes-tabs .nav-link.active').should('contain', 'Informes de Proveedores');
    cy.get('#formProviderReportType').should('be.visible');
    
    // Cambiar a pestaña de usuarios
    cy.get('#informes-tabs .nav-link').contains('Informes de Usuarios').click();
    cy.get('#informes-tabs .nav-link.active').should('contain', 'Informes de Usuarios');
    cy.get('#formUserReportType').should('be.visible');
    
    // Volver a pestaña de productos
    cy.get('#informes-tabs .nav-link').contains('Informes de Productos').click();
    cy.get('#informes-tabs .nav-link.active').should('contain', 'Informes de Productos');
    cy.get('#formProductReportType').should('be.visible');
  });

  it('Debe cerrar sesión correctamente', () => {
    cy.get('button[aria-label="Cerrar sesión"]').click();
    cy.url().should('include', '/');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
      expect(win.localStorage.getItem('user')).to.be.null;
    });
  });
});