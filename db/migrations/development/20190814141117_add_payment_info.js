exports.up = function(knex, Promise) {};

exports.down = function(knex, Promise) {};

// fields to add, to dev / test / prod migrations and fields table:
// paymentType (req only for retirees, text one of 'check' | 'card', no SF info yet)
// medicaidRes (req only for afh, numeric(1,0), Direct_join_rate__c.AFH_Number_of_Residents__c)
// memberShortId (req only for pmt required, returned from unioni.se, no SF info yet)
// memberId (req only for pmt required, returned from unioni.se, no SF info yet)
// stripeCustomerId (req only for pmt required, returned from unioni.se, no SF info yet)
// cardAddingUrl (req only for pmt required, returned from unioni.se, no SF info yet)
// paymentMethodAdded (bool, req only for pmt required)
// activePaymentMethodLast4 (returned from unionise if existing payment method, but maybe we can get from SF direct_join_rate instead?)
