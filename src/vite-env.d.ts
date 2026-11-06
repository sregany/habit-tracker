/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_NUMBER?: string
  readonly VITE_WHATSAPP_MESSAGE?: string
  readonly VITE_CONTACT_PHONE?: string
  readonly VITE_CONTACT_EMAIL?: string
  readonly VITE_CONTACT_ADDRESS?: string
  readonly VITE_SERVICE_AREA?: string
  readonly VITE_FORM_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
