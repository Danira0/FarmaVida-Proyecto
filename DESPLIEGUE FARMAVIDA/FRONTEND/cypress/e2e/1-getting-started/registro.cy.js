/// <reference types="cypress" />

describe('Register Page', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('Debe mostrar todos los campos del formulario de registro y los botones de rol', () => {
    cy.contains('Registro');
    cy.get('button').contains('Soy Administrador').should('exist');
    cy.get('button').contains('Soy Empleado').should('exist');
    cy.get('input#nombre').should('exist');
    cy.get('input#apellido').should('exist');
    cy.get('input#correo').should('exist');
    cy.get('input#nombre_usuario').should('exist');
    cy.get('input#contraseña').should('exist');
    cy.get('input#confirmar-password').should('exist');
    cy.get('button[type=submit]').should('exist');
    cy.contains('¿Tienes Cuenta?').should('exist');
    cy.get('a').contains('Ingresar').should('exist');
  });

  it('Debe mostrar error si las contraseñas no coinciden', () => {
    cy.get('button').contains('Soy Administrador').click();
    cy.get('input#nombre').type('Juan');
    cy.get('input#apellido').type('Perez');
    cy.get('input#correo').type('juan.perez@example.com');
    cy.get('input#nombre_usuario').type('juanp');
    cy.get('input#contraseña').type('123456');
    cy.get('input#confirmar-password').type('654321');
    cy.get('button[type=submit]').click();
    cy.contains('Las contraseñas no coinciden.').should('be.visible');
  });

  it('Debe permitir seleccionar el rol de Administrador y Empleado', () => {
    cy.get('button').contains('Soy Administrador').click()
      .should('have.class', 'btn-success');
    cy.get('button').contains('Soy Empleado').click()
      .should('have.class', 'btn-success');
  });

  it('Debe mostrar error si la API responde con error', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: { message: 'Correo ya registrado.' }
    }).as('registerRequest');

    cy.get('button').contains('Soy Empleado').click();
    cy.get('input#nombre').type('Ana');
    cy.get('input#apellido').type('Lopez');
    cy.get('input#correo').type('ana.lopez@example.com');
    cy.get('input#nombre_usuario').type('analopez');
    cy.get('input#contraseña').type('123456');
    cy.get('input#confirmar-password').type('123456');
    cy.get('button[type=submit]').click();

    cy.wait('@registerRequest');
    cy.contains('Correo ya registrado.').should('be.visible');
  });

  it('Debe mostrar mensaje de pendiente aprobación si el registro es exitoso', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: { message: 'Notificación enviada al administrador para aprobación.' }
    }).as('registerRequest');

    cy.get('button').contains('Soy Empleado').click();
    cy.get('input#nombre').type('Carlos');
    cy.get('input#apellido').type('Gomez');
    cy.get('input#correo').type('carlos.gomez@example.com');
    cy.get('input#nombre_usuario').type('cgomez');
    cy.get('input#contraseña').type('123456');
    cy.get('input#confirmar-password').type('123456');
    cy.get('button[type=submit]').click();

    cy.wait('@registerRequest');
    cy.contains('Tu registro está pendiente de aprobación. ¡Pendiente a tu correo!').should('be.visible');
  });

  it('Debe mostrar mensaje de aprobación si el admin aprueba el registro', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: { message: 'Notificación enviada al administrador para aprobación.' }
    }).as('registerRequest');

    cy.intercept('GET', /\/api\/auth\/check-approval\/checkApproval\?correo=lucia\.martinez@example\.com/, {
      statusCode: 200,
      body: { aprobado: 1 }
    }).as('checkApproval');

    cy.clock();

    cy.get('button').contains('Soy Administrador').click();
    cy.get('input#nombre').type('Lucia');
    cy.get('input#apellido').type('Martinez');
    cy.get('input#correo').type('lucia.martinez@example.com');
    cy.get('input#nombre_usuario').type('lmartinez');
    cy.get('input#contraseña').type('123456');
    cy.get('input#confirmar-password').type('123456');
    cy.get('button[type=submit]').click();

    cy.wait('@registerRequest');
    cy.contains('Tu registro está pendiente de aprobación. ¡Pendiente a tu correo!').should('be.visible');

    cy.tick(5000);

    cy.wait('@checkApproval');
    cy.contains('Tu registro ha sido aprobado. ¡Bienvenido!, sera redirigido en 3 segundos.').should('be.visible');
  });
});