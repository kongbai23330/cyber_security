// test if "No matched result" render on the index page if no post in db
describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/')
    cy.get('#search').click()
    cy.get('#no-res').should('have.text', 'No matched result');
  })
})
// Passed
