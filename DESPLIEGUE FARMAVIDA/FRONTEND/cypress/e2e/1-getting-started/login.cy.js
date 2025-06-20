/// <reference types="cypress" />

describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Debe mostrar el formulario de login y los botones de rol', () => {
    cy.contains('Iniciar Sesión');
    cy.get('button').contains('Soy Administrador').should('exist');
    cy.get('button').contains('Soy Empleado').should('exist');
    cy.get('input#nombre_usuario').should('exist');
    cy.get('input#contrasena_usuario').should('exist');
    cy.get('button[type=submit]').should('exist');
    cy.contains('¿Olvidó la contraseña?').should('exist');
    cy.contains('¿No tiene una cuenta?').should('exist');
  });

  it('Debe mostrar advertencia si no se llenan los campos', () => {
    cy.get('button[type=submit]').click();
    cy.contains('Por favor, complete todos los campos y seleccione un rol.').should('be.visible');
  });

  it('Debe mostrar advertencia si solo se llena usuario', () => {
    cy.get('input#nombre_usuario').type('admin');
    cy.get('button[type=submit]').click();
    cy.contains('Por favor, complete todos los campos y seleccione un rol.').should('be.visible');
  });

  it('Debe mostrar advertencia si falta seleccionar el rol', () => {
    cy.get('input#nombre_usuario').type('admin');
    cy.get('input#contrasena_usuario').type('123456');
    cy.get('button[type=submit]').click();
    cy.contains('Por favor, complete todos los campos y seleccione un rol.').should('be.visible');
  });

  it('Debe permitir seleccionar el rol de Administrador y Empleado', () => {
    cy.get('button').contains('Soy Administrador').click()
      .should('have.class', 'btn-success');
    cy.get('button').contains('Soy Empleado').click()
      .should('have.class', 'btn-success');
  });

  it('Debe mostrar error si la API responde con error', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        message: 'Usuario, contraseña o rol incorrectos.',
      },
    }).as('loginRequest');

    cy.get('input#nombre_usuario').type('usuario');
    cy.get('input#contrasena_usuario').type('incorrecta');
    cy.get('button').contains('Soy Empleado').click();
    cy.get('button[type=submit]').click();

    cy.wait('@loginRequest');
    cy.contains('Usuario, contraseña o rol incorrectos.').should('be.visible');
  });

  it('Debe iniciar sesión correctamente como Administrador y redirigir', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-admin-token',
        user: {
          id: 1,
          nombre: 'Admin',
          nombre_usuario: 'admin',
          rol: 'Administrador',
          rolId: 1,
        },
      },
    }).as('loginAdminRequest');

    cy.get('input#nombre_usuario').type('admin');
    cy.get('input#contrasena_usuario').type('passwordadmin');
    cy.get('button').contains('Soy Administrador').click();
    cy.get('button[type=submit]').click();

    cy.wait('@loginAdminRequest');
    cy.contains('Redirigiendo al panel de Administrador...').should('be.visible');
    // cy.url().should('include', '/homeadmi');
  });

  it('Debe iniciar sesión correctamente como Empleado y redirigir', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-empleado-token',
        user: {
          id: 2,
          nombre: 'Empleado',
          nombre_usuario: 'empleado',
          rol: 'Empleado',
          rolId: 2,
        },
      },
    }).as('loginEmpleadoRequest');

    cy.get('input#nombre_usuario').type('empleado');
    cy.get('input#contrasena_usuario').type('passwordempleado');
    cy.get('button').contains('Soy Empleado').click();
    cy.get('button[type=submit]').click();

    cy.wait('@loginEmpleadoRequest');
    cy.contains('Redirigiendo al panel de Empleado...').should('be.visible');
    // cy.url().should('include', '/homeempleado');
  });
});