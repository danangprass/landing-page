/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	Banners: "banners",
	CartItems: "cart_items",
	Categories: "categories",
	NewsletterSubscribers: "newsletter_subscribers",
	OrderItems: "order_items",
	Orders: "orders",
	Products: "products",
	Reviews: "reviews",
	Testimonials: "testimonials",
	Users: "users",
	Wishlists: "wishlists",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type BannersRecord = {
	active?: boolean
	id: string
	image?: FileNameString
	link_url?: string
	sort_order?: number
	subtitle?: string
	title?: string
}

export type CartItemsRecord = {
	id: string
	product: RecordIdString
	quantity: number
	user: RecordIdString
}

export type CategoriesRecord = {
	active?: boolean
	description?: string
	id: string
	image?: FileNameString
	name: string
	slug: string
	sort_order?: number
}

export type NewsletterSubscribersRecord = {
	active?: boolean
	email: string
	id: string
}

export type OrderItemsRecord = {
	id: string
	order: RecordIdString
	price: number
	product: RecordIdString
	quantity: number
}

export const OrdersStatusOptions = {
	"pending": "pending",
	"processing": "processing",
	"shipped": "shipped",
	"delivered": "delivered",
	"cancelled": "cancelled",
} as const
export type OrdersStatusOptions = typeof OrdersStatusOptions[keyof typeof OrdersStatusOptions]
export type OrdersRecord = {
	billing_address?: string
	id: string
	shipping_address?: string
	status: OrdersStatusOptions
	total: number
	user: RecordIdString
}

export type ProductsRecord = {
	active?: boolean
	category?: RecordIdString
	compare_at_price?: number
	description?: string
	featured?: boolean
	id: string
	images?: FileNameString[]
	name: string
	price: number
	sku?: string
	slug: string
	stock?: number
}

export type ReviewsRecord = {
	body?: string
	id: string
	product: RecordIdString
	rating: number
	title?: string
	user: RecordIdString
}

export type TestimonialsRecord = {
	active?: boolean
	avatar?: FileNameString
	body: string
	id: string
	name: string
	rating?: number
	role?: string
	sort_order?: number
}

export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type WishlistsRecord = {
	id: string
	product: RecordIdString
	user: RecordIdString
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type BannersResponse<Texpand = unknown> = Required<BannersRecord> & BaseSystemFields<Texpand>
export type CartItemsResponse<Texpand = unknown> = Required<CartItemsRecord> & BaseSystemFields<Texpand>
export type CategoriesResponse<Texpand = unknown> = Required<CategoriesRecord> & BaseSystemFields<Texpand>
export type NewsletterSubscribersResponse<Texpand = unknown> = Required<NewsletterSubscribersRecord> & BaseSystemFields<Texpand>
export type OrderItemsResponse<Texpand = unknown> = Required<OrderItemsRecord> & BaseSystemFields<Texpand>
export type OrdersResponse<Texpand = unknown> = Required<OrdersRecord> & BaseSystemFields<Texpand>
export type ProductsResponse<Texpand = unknown> = Required<ProductsRecord> & BaseSystemFields<Texpand>
export type ReviewsResponse<Texpand = unknown> = Required<ReviewsRecord> & BaseSystemFields<Texpand>
export type TestimonialsResponse<Texpand = unknown> = Required<TestimonialsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>
export type WishlistsResponse<Texpand = unknown> = Required<WishlistsRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	banners: BannersRecord
	cart_items: CartItemsRecord
	categories: CategoriesRecord
	newsletter_subscribers: NewsletterSubscribersRecord
	order_items: OrderItemsRecord
	orders: OrdersRecord
	products: ProductsRecord
	reviews: ReviewsRecord
	testimonials: TestimonialsRecord
	users: UsersRecord
	wishlists: WishlistsRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	banners: BannersResponse
	cart_items: CartItemsResponse
	categories: CategoriesResponse
	newsletter_subscribers: NewsletterSubscribersResponse
	order_items: OrderItemsResponse
	orders: OrdersResponse
	products: ProductsResponse
	reviews: ReviewsResponse
	testimonials: TestimonialsResponse
	users: UsersResponse
	wishlists: WishlistsResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
