/// <reference types="cypress" />

describe('Proveedor Page', () => {
  beforeEach(() => {
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

    // Intercepta todas las rutas necesarias
    cy.intercept('GET', '**/obtener/proveedores', {
      statusCode: 200,
      body: [
        {
          ID_Laboratorio: 1,
          nombre: 'LabUno',
          direccion: 'Calle 1',
          ciudad: 'Ciudad1',
          telefono: '123456789',
          correo_electronico: 'labuno@correo.com',
          pagina_web: 'www.labuno.com',
          imagen_producto: 'img1.png'
        }
      ]
    }).as('getProveedores');

    // Intercepta también la ruta POST por si acaso
    cy.intercept('POST', '**/registrar/proveedores', {
      statusCode: 200,
      body: { message: 'Proveedor registrado correctamente' }
    }).as('registrarProveedor');

    cy.visit('/proveedor');
    cy.wait('@getProveedores', { timeout: 10000 });
  });

  it('Debe mostrar la tabla de proveedores con los datos', () => {
    cy.contains('Añadir Proveedor').should('be.visible');
    cy.get('table').should('exist');
    cy.get('td').contains('LabUno').scrollIntoView().should('be.visible');
    cy.get('td').contains('Calle 1').scrollIntoView().should('be.visible');
    cy.get('td').contains('Ciudad1').scrollIntoView().should('be.visible');
    cy.get('td').contains('labuno@correo.com').scrollIntoView().should('be.visible');
    cy.get('td').contains('www.labuno.com').scrollIntoView().should('be.visible');
    cy.get('img[alt="Imagen del proveedor"]').should('exist');
  });

  it('Debe abrir el modal de registro al hacer clic en "Añadir Proveedor"', () => {
    cy.get('button').contains('Añadir Proveedor').click();
    cy.get('#modalProveedor').should('be.visible');
    cy.contains('Registrar Proveedor').should('be.visible');
    cy.get('#nombre').should('be.visible');
    cy.get('button').contains('Guardar').scrollIntoView().should('be.visible');
    cy.get('button').contains('Cerrar').scrollIntoView().should('be.visible');
  });

  it('Debe validar campos obligatorios en el registro', () => {
    cy.get('button').contains('Añadir Proveedor').click();
    cy.get('#modalProveedor').should('be.visible');
    cy.get('button').contains('Guardar').scrollIntoView().should('be.visible').click();
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'El campo nombre es obligatorio');
    cy.get('.swal2-confirm').click();

    cy.get('#nombre').type('NuevoLab');
    cy.get('button').contains('Guardar').scrollIntoView().should('be.visible').click();
    cy.get('.swal2-title').should('contain', 'El campo dirección es obligatorio');
    cy.get('.swal2-confirm').click();
  });

  it('Debe registrar un proveedor correctamente', () => {
    cy.intercept('POST', '**/registrar/proveedores', {
      statusCode: 200,
      body: { message: 'Proveedor registrado correctamente' }
    }).as('registrarProveedor');
    
    cy.intercept('GET', '**/obtener/proveedores', {
      statusCode: 200,
      body: [{
        ID_Laboratorio: 2,
        nombre: 'Proveedor2',
        direccion: 'Calle 2',
        ciudad: 'Ciudad2',
        telefono: '987654321',
        correo_electronico: 'proveedor2@correo.com',
        pagina_web: 'www.prov2.com',
        imagen_producto: ''
      }]
    }).as('getProveedoresNuevo');

    cy.get('button').contains('Añadir Proveedor').click();
    cy.get('#modalProveedor').should('be.visible');
    
    // Usa selectores más específicos para los inputs
    cy.get('#nombre').type('Proveedor2');
    cy.get('input[placeholder="Dirección"]').type('Calle 2');
    cy.get('input[placeholder="Ciudad"]').type('Ciudad2');
    cy.get('input[placeholder="Teléfono"]').type('987654321');
    cy.get('input[placeholder="Correo Electrónico"]').type('proveedor2@correo.com');
    cy.get('input[placeholder="Página Web"]').type('www.prov2.com');
    
    // Asegúrate de que el botón esté visible y habilitado antes de hacer clic
    cy.get('button').contains('Guardar').scrollIntoView()
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Aumenta el timeout para esperar la respuesta
    cy.wait('@registrarProveedor', { timeout: 10000 });
    cy.wait('@getProveedoresNuevo', { timeout: 10000 });
    
    // Verifica que aparezca el mensaje de éxito
    cy.get('.swal2-title').should('contain', 'Exito');
    cy.get('.swal2-html-container').should('contain', 'Proveedor registrado correctamente');
    cy.get('.swal2-confirm').click();
    
    // Verifica que el nuevo proveedor aparezca en la tabla
    cy.get('td').contains('Proveedor2').scrollIntoView().should('be.visible');
  });

  it('Debe mostrar el modal de edición con datos al hacer clic en editar', () => {
    cy.get('button.btn-warning').first().click();
    cy.get('#modalProveedor').should('be.visible');
    cy.contains('Editar Proveedor').should('be.visible');
    cy.get('#nombre').should('have.value', 'LabUno');
    cy.get('input[placeholder="Dirección"]').should('have.value', 'Calle 1');
    cy.get('input[placeholder="Ciudad"]').should('have.value', 'Ciudad1');
    cy.get('input[placeholder="Teléfono"]').should('have.value', '123456789');
    cy.get('input[placeholder="Correo Electrónico"]').should('have.value', 'labuno@correo.com');
    cy.get('input[placeholder="Página Web"]').should('have.value', 'www.labuno.com');
    cy.get('button').contains('Guardar').scrollIntoView().should('be.visible');
  });

  it('Debe actualizar un proveedor correctamente', () => {
    cy.intercept('PUT', '**/actualizar/proveedores/1', {
      statusCode: 200,
      body: { message: 'Proveedor actualizado correctamente' }
    }).as('actualizarProveedor');
    
    cy.intercept('GET', '**/obtener/proveedores', {
      statusCode: 200,
      body: [{
        ID_Laboratorio: 1,
        nombre: 'LabUnoEditado',
        direccion: 'Calle 1',
        ciudad: 'Ciudad1',
        telefono: '123456789',
        correo_electronico: 'labuno@correo.com',
        pagina_web: 'www.labuno.com',
        imagen_producto: 'img1.png'
      }]
    }).as('getProveedoresEditado');

    cy.get('button.btn-warning').first().click();
    cy.get('#modalProveedor').should('be.visible');
    cy.get('#nombre').clear().type('LabUnoEditado');
    cy.get('button').contains('Guardar').scrollIntoView()
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    cy.wait('@actualizarProveedor', { timeout: 10000 });
    cy.wait('@getProveedoresEditado', { timeout: 10000 });
    
    cy.get('.swal2-title').should('contain', 'Exito');
    cy.get('.swal2-html-container').should('contain', 'Proveedores actualizado correctamente');
    cy.get('.swal2-confirm').click();
    
    cy.get('td').contains('LabUnoEditado').scrollIntoView().should('be.visible');
  });

  it('Debe mostrar error si la API falla al registrar proveedor', () => {
    cy.intercept('POST', '**/registrar/proveedores', {
      statusCode: 400,
      body: { message: 'Error al registrar proveedor' }
    }).as('registrarProveedorError');

    cy.get('button').contains('Añadir Proveedor').click();
    cy.get('#modalProveedor').should('be.visible');
    cy.get('#nombre').clear().type('ProveedorError');
    cy.get('input[placeholder="Dirección"]').clear().type('DireccionError');
    cy.get('input[placeholder="Ciudad"]').clear().type('CiudadError');
    cy.get('input[placeholder="Teléfono"]').clear().type('12345');
    cy.get('input[placeholder="Correo Electrónico"]').clear().type('correo@error.com');
    cy.get('input[placeholder="Página Web"]').clear().type('www.error.com');
    
    cy.get('button').contains('Guardar').scrollIntoView()
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    cy.wait('@registrarProveedorError', { timeout: 10000 });
    
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Error');
    cy.get('.swal2-html-container').should('contain', 'Error al registrar proveedor');
  });

  it('Debe eliminar un proveedor correctamente', () => {
    cy.intercept('DELETE', '**/eliminar/proveedores/1', {
      statusCode: 200,
      body: { message: 'Proveedor eliminado correctamente' }
    }).as('eliminarProveedor');
    
    cy.intercept('GET', '**/obtener/proveedores', {
      statusCode: 200,
      body: []
    }).as('getProveedoresVacio');

    cy.get('button.btn-danger').first().click();
    cy.get('.swal2-title').should('contain', '¿Estás seguro de eliminar a LabUno?');
    cy.get('.swal2-confirm').click();
    
    cy.wait('@eliminarProveedor', { timeout: 10000 });
    cy.wait('@getProveedoresVacio', { timeout: 10000 });
    
    cy.get('.swal2-title').should('contain', 'Proveedor eliminado correctamente');
    cy.get('.swal2-confirm').click();
    cy.get('td').should('not.exist');
  });

  it('Debe cancelar la eliminación de un proveedor', () => {
    cy.get('button.btn-danger').first().click();
    cy.get('.swal2-title').should('contain', '¿Estás seguro de eliminar a LabUno?');
    cy.get('.swal2-cancel').click();
    cy.get('.swal2-title').should('contain', 'Operación cancelada');
    cy.get('.swal2-confirm').click();
    cy.get('td').contains('LabUno').scrollIntoView().should('be.visible');
  });

  it('Debe cerrar el modal de registro/edición', () => {
    cy.get('button').contains('Añadir Proveedor').click();
    cy.get('#modalProveedor').should('be.visible');
    cy.get('button#btnCerrar').scrollIntoView().click();
    cy.contains('Registrar Proveedor').should('not.exist');
  });
});