import StoreUserValidator from "../../Validators/Auth/StoreUserValidator";
import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import LoginValidator from "../../Validators/Auth/LoginValidator";
import UpdateUserValidator from "../../Validators/Auth/UpdateUserValidator";

export default class AuthController {
  public async register({ request, response } : HttpContextContract) {
    console.log(request)
    const payload = await request.validate(StoreUserValidator)

    const user = await User.create(payload)

    return response.created(user)
  }

  public async login({ request, auth, response } : HttpContextContract) {
    const { email, password } = await request.validate(LoginValidator)

    const token = await auth.attempt(email, password)

    return response.ok({
      "token": token,
    })
  }

  public async me({ auth, response } : HttpContextContract) {

    return response.ok(auth.user)
  }

  public async update({ request, auth, response } : HttpContextContract) {
    const payload = await request.validate(UpdateUserValidator)

    const user = await auth.user!.merge(payload).save()

    return response.ok(user)
  }

  public async logout({ auth, response } : HttpContextContract) {
    await auth.logout()

    return response.noContent()
  }

}
