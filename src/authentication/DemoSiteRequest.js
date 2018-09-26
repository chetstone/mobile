/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */
import { hashPassword } from 'sussol-utilities';
import { validationStrings } from '../localization';
export class DemoSiteRequest {
  async createActivationURL(username, email, password, repeatPassword) {
    // Client side validation
    if (email.length === 0) throw new Error(validationStrings.email.required);
    if (!this.validateEmail(email)) throw new Error(validationStrings.email.valid);
    if (username.length === 0) throw new Error(validationStrings.username.required);
    if (password.length === 0) throw new Error(validationStrings.password.required);
    if (repeatPassword.length === 0) throw new Error(validationStrings.repeatPassword.required);
    if (password !== repeatPassword) throw new Error(validationStrings.password.matchRepeat);
    if (this.textLengthInvalid(password)) throw new Error(validationStrings.password.lengthInvalid);
    if (this.textContainsSpaces(password)) {
      throw new Error(validationStrings.password.containsSpaces);
    }
    // Hash the password
    const passwordHash = hashPassword(password);
    // Need proper demo server URL in 4D to work
    const domainName = 'http://192.168.3.145:7848';
    const URL = `${domainName}/api/v4/mobile/requestDemo`;

    let responseJson;
    try {
      const response = await fetch(URL, {
        method: 'POST',
        body: JSON.stringify({
          username: username,
          email: email,
          password: passwordHash,
        }),
      });
      responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.error);
      }
      return responseJson;
    } catch (error) {
      // Pass error up
      throw error;
    }
  }

  // Validation methods
  // TODO: Could be extracted to a helper file to be used elsewhere
  validateEmail(text) {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(text);
  }

  textContainsSpaces(text) {
    const reg = /^\S*$/;
    return !(reg.test(text));
  }

  textLengthInvalid(text, lessThen = 8, greaterThen = 32) {
    return text.length < lessThen || text.length > greaterThen;
  }
}
