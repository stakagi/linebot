provider "azurerm" {
  version = "=1.21.0"
  subscription_id = "d3c5288f-a14a-4346-913b-e5060e3a4181"
}

variable "channel_access_token" {}
variable "channel_secret" {}
variable "api_key_yahoo" {}
variable "api_key_resas" {}

resource "azurerm_resource_group" "default" {
  name     = "linebot"
  location = "Japan East"
}

resource "azurerm_app_service_plan" "default" {
  name                = "${azurerm_resource_group.default.name}-plan"
  location            = "${azurerm_resource_group.default.location}"
  resource_group_name = "${azurerm_resource_group.default.name}"
  kind                = "Linux"
  reserved            = "true"

  sku {
    tier = "Basic"
    size = "B1"
  }
}

resource "azurerm_app_service" "default" {
  name                = "${azurerm_resource_group.default.name}-appservice"
  location            = "${azurerm_resource_group.default.location}"
  resource_group_name = "${azurerm_resource_group.default.name}"
  app_service_plan_id = "${azurerm_app_service_plan.default.id}"
  https_only          = "true"

  app_settings {
    CHANNEL_ACCESS_TOKEN                = "${var.channel_access_token}"
    CHANNEL_SECRET                      = "${var.channel_secret}"
    API_KEY_YAHOO                       = "${var.api_key_yahoo}"
    API_KEY_RESAS                       = "${var.api_key_resas}"
    BASE_URL                            = "https://${azurerm_resource_group.default.name}-appservice.azurewebsites.net"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    DOCKER_ENABLE_CI                    = "true"
    DOCKER_REGISTRY_SERVER_URL          = "https://index.docker.io"
  }

  site_config {
    linux_fx_version = "DOCKER|shunichitakagi/linebot:latest"
    always_on        = "true"
  }

  identity {
    type = "SystemAssigned"
  }
}