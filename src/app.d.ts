/// <reference types="@sveltejs/kit" />
import PocketBase from 'pocketbase';

declare global {
  namespace App {
    interface Locals {
      pb: PocketBase;
      user: Record<string, unknown> | null;
      isSuperuser: boolean;
    }
  }
}

export {};
