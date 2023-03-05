// test can user login
describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/sign");
    cy.get('#username').type('asdfgh');
    cy.get('#password').type('Qwerty123');
    cy.on("window:alert", (message) => {
      expect(message).to.contain("Login Successful");
    });
    cy.get('#signin').click()

  });
});
// Passed
