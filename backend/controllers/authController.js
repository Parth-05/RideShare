import { getCustomerProfile } from './customerController.js';
import { getDriverProfile } from './driverController.js';


export const getUserProfile = async (req, res) => {

    const user = req.user; // set by authenticate middleware
    if (user.role === 'customer') {
      return getCustomerProfile(req, res);
}
else if (user.role === 'driver') {
      return getDriverProfile(req, res);
    }
};