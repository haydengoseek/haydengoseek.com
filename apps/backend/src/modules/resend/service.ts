import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"
import type { NotificationTypes } from "@medusajs/framework/types"
import { Resend } from "resend"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
  api_key: string
  from: string
}

export class ResendNotificationService extends AbstractNotificationProviderService {
  static identifier = "resend"

  protected logger_: Logger
  protected options_: Options
  protected client_: Resend

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options
    this.client_ = new Resend(options.api_key)
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "api_key is required in the resend provider's options.")
    }
    if (!options.from) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "from is required in the resend provider's options.")
    }
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No notification information provided")
    }

    const { error, data } = await this.client_.emails.send({
      from: notification.from?.trim() || this.options_.from,
      to: notification.to,
      subject: notification.content?.subject ?? "",
      html: notification.content?.html ?? "",
    })

    if (error) {
      this.logger_.error(`Failed to send email via Resend: ${error.message}`)
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Failed to send email: ${error.message}`)
    }

    return { id: data?.id }
  }
}
