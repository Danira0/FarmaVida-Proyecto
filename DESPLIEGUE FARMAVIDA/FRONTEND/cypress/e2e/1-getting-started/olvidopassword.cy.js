/// <reference types="cypress" />

describe('OlvidoContrasena Page', () => {
  beforeEach(() => {
    cy.visit('/olvidoContrasena');
  });

  it('Debe mostrar el campo de email y el botón para enviar código', () => {
    cy.get('h2').contains('Recuperar Contraseña').should('be.visible');
    cy.get('input#email[type="email"]').should('be.visible');
    cy.get('button[type="submit"]').contains('Enviar Código').should('be.visible');
    cy.get('a').contains('Volver al inicio de sesión').should('be.visible');
  });

  it('Debe mostrar mensaje de error si la API responde con error al solicitar código', () => {
    cy.intercept('POST', '/api/auth/request-password-reset', {
      statusCode: 400,
      body: { message: 'Usuario no existe' }
    }).as('requestReset');

    cy.get('input#email').type('noexiste@example.com');
    cy.get('button[type="submit"]').click();

    cy.wait('@requestReset');
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Error');
    cy.get('.swal2-html-container').should('contain', 'Usuario no existe');
  });

  it('Debe mostrar mensaje de éxito y pasar al paso 2 si el código es enviado correctamente', () => {
    cy.intercept('POST', '/api/auth/request-password-reset', {
      statusCode: 200,
      body: { token: 'token-mock' }
    }).as('requestReset');

    cy.get('input#email').type('usuario@example.com');
    cy.get('button[type="submit"]').click();

    cy.wait('@requestReset');
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Código enviado');
    cy.get('.swal2-html-container').should('contain', 'Se ha enviado un código de verificación a tu correo electrónico.');
    cy.get('.swal2-confirm').click();
    cy.get('h2').contains('Verificar Código').should('be.visible');
    cy.get('input#verificar-codigo').should('be.visible');
  });

  it('Debe mostrar error si el código es incorrecto', () => {
    // Ir hasta el paso 2 primero
    cy.intercept('POST', '/api/auth/request-password-reset', {
      statusCode: 200,
      body: { token: 'token-mock' }
    }).as('requestReset');
    cy.get('input#email').type('usuario@example.com');
    cy.get('button[type="submit"]').click();
    cy.wait('@requestReset');
    cy.get('.swal2-confirm').click();

    cy.intercept('POST', '/api/auth/verify-reset-code', {
      statusCode: 400,
      body: { message: 'Código incorrecto' }
    }).as('verifyCode');

    cy.get('input#verificar-codigo').type('123456');
    cy.get('button[type="submit"]').contains('Verificar Código').click();

    cy.wait('@verifyCode');
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Error');
    cy.get('.swal2-html-container').should('contain', 'Código incorrecto');
  });

  it('Debe avanzar a paso 3 si el código es correcto', () => {
    cy.intercept('POST', '/api/auth/request-password-reset', {
      statusCode: 200,
      body: { token: 'token-mock' }
    }).as('requestReset');
    cy.get('input#email').type('usuario@example.com');
    cy.get('button[type="submit"]').click();
    cy.wait('@requestReset');
    cy.get('.swal2-confirm').click();

    cy.intercept('POST', '/api/auth/verify-reset-code', {
      statusCode: 200,
      body: { resetToken: 'reset-token-mock' }
    }).as('verifyCode');

    cy.get('input#verificar-codigo').type('654321');
    cy.get('button[type="submit"]').contains('Verificar Código').click();

    cy.wait('@verifyCode');
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Código verificado');
    cy.get('.swal2-confirm').click();
    cy.get('h2').contains('Nueva Contraseña').should('be.visible');
    cy.get('input#new-contraseña').should('be.visible');
    cy.get('input#confirmar-contraseña').should('be.visible');
  });

  it('Debe mostrar error si las contraseñas no coinciden', () => {
    // Hasta paso 3
    cy.intercept('POST', '/api/auth/request-password-reset', {
      statusCode: 200,
      body: { token: 'token-mock' }
    }).as('requestReset');
    cy.get('input#email').type('usuario@example.com');
    cy.get('button[type="submit"]').click();
    cy.wait('@requestReset');
    cy.get('.swal2-confirm').click();

    cy.intercept('POST', '/api/auth/verify-reset-code', {
      statusCode: 200,
      body: { resetToken: 'reset-token-mock' }
    }).as('verifyCode');
    cy.get('input#verificar-codigo').type('654321');
    cy.get('button[type="submit"]').contains('Verificar Código').click();
    cy.wait('@verifyCode');
    cy.get('.swal2-confirm').click();

    cy.get('input#new-contraseña').type('newpassword');
    cy.get('input#confirmar-contraseña').type('differentpassword');
    cy.get('button[type="submit"]').contains('Establecer Nueva Contraseña').click();

    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Error');
    cy.get('.swal2-html-container').should('contain', 'Las contraseñas no coinciden');
  });

  it('Debe mostrar mensaje de éxito y redirigir tras actualizar contraseña correctamente', () => {
    // Hasta paso 3
    cy.intercept('POST', '/api/auth/request-password-reset', {
      statusCode: 200,
      body: { token: 'token-mock' }
    }).as('requestReset');
    cy.get('input#email').type('usuario@example.com');
    cy.get('button[type="submit"]').click();
    cy.wait('@requestReset');
    cy.get('.swal2-confirm').click();

    cy.intercept('POST', '/api/auth/verify-reset-code', {
      statusCode: 200,
      body: { resetToken: 'reset-token-mock' }
    }).as('verifyCode');
    cy.get('input#verificar-codigo').type('654321');
    cy.get('button[type="submit"]').contains('Verificar Código').click();
    cy.wait('@verifyCode');
    cy.get('.swal2-confirm').click();

    cy.intercept('POST', '/api/auth/reset-password', {
      statusCode: 200,
      body: {}
    }).as('resetPass');

    cy.get('input#new-contraseña').type('mypassword');
    cy.get('input#confirmar-contraseña').type('mypassword');
    cy.get('button[type="submit"]').contains('Establecer Nueva Contraseña').click();

    cy.wait('@resetPass');
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Contraseña actualizada');
    cy.get('.swal2-html-container').should('contain', 'Tu contraseña ha sido actualizada correctamente.');
  });

  it('Debe mostrar error si la API responde con error al actualizar contraseña', () => {
    // Hasta paso 3
    cy.intercept('POST', '/api/auth/request-password-reset', {
      statusCode: 200,
      body: { token: 'token-mock' }
    }).as('requestReset');
    cy.get('input#email').type('usuario@example.com');
    cy.get('button[type="submit"]').click();
    cy.wait('@requestReset');
    cy.get('.swal2-confirm').click();

    cy.intercept('POST', '/api/auth/verify-reset-code', {
      statusCode: 200,
      body: { resetToken: 'reset-token-mock' }
    }).as('verifyCode');
    cy.get('input#verificar-codigo').type('654321');
    cy.get('button[type="submit"]').contains('Verificar Código').click();
    cy.wait('@verifyCode');
    cy.get('.swal2-confirm').click();

    cy.intercept('POST', '/api/auth/reset-password', {
      statusCode: 400,
      body: { message: 'Token inválido o expirado.' }
    }).as('resetPass');

    cy.get('input#new-contraseña').type('mypassword');
    cy.get('input#confirmar-contraseña').type('mypassword');
    cy.get('button[type="submit"]').contains('Establecer Nueva Contraseña').click();

    cy.wait('@resetPass');
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Error');
    cy.get('.swal2-html-container').should('contain', 'Token inválido o expirado.');
  });

it('Debe permitir volver atrás del paso 2 al 1 y del 3 al 2', () => {
  // Paso 1 a 2
  cy.intercept('POST', '/api/auth/request-password-reset', {
    statusCode: 200,
    body: { token: 'token-mock' }
  }).as('requestReset');

  cy.get('input#email').type('usuario@example.com');
  cy.get('button[type="submit"]').click();
  cy.wait('@requestReset');
  cy.get('.swal2-confirm').click();

  // Paso 2 a 1
  cy.get('button').contains('Volver atrás').click();
  cy.get('h2').contains('Recuperar Contraseña').should('be.visible');

  // Ir a paso 2 de nuevo
  cy.get('input#email').clear().type('usuario@example.com'); // IMPORTANTE: limpiar antes de tipear
  cy.get('button[type="submit"]').click();
  cy.wait('@requestReset');
  cy.get('.swal2-confirm').click();

  // Paso 2 a 3
  cy.intercept('POST', '/api/auth/verify-reset-code', {
    statusCode: 200,
    body: { resetToken: 'reset-token-mock' }
  }).as('verifyCode');
  cy.get('input#verificar-codigo').type('654321');
  cy.get('button[type="submit"]').contains('Verificar Código').click();
  cy.wait('@verifyCode');
  cy.get('.swal2-confirm').click();

  // Paso 3 a 2
  cy.get('button').contains('Volver atrás').click();
  cy.get('h2').contains('Verificar Código').should('be.visible');
    });
});