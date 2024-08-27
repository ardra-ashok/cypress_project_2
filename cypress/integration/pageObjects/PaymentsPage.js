class PaymentsPage{
 get_paymenentsPage_title() {
  return cy.get('.payment-group .step-title')
 }
 get_cartSection_title() {
  return cy.get('.opc-block-summary .title')
 }
 get_PlaceOrderBtn() {
  return cy.get('.primary .checkout')
 }
 get_PaymentSuccess_msg() {
  return cy.get('.base')
 }
}

export default PaymentsPage