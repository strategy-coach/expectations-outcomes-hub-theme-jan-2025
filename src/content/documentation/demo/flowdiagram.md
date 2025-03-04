---
title: Diagrams
description: Mermaid Diagram, Plantuml Diagram
enableMermaid: true

---

# Diagrams

## Mermaid Diagram

Use the following sample code snippet to add a Mermaid diagram in mark down:
```
<p class="mermaid">
sequenceDiagram
    participant web as Web Browser
    participant blog as Blog Service
    participant account as Account Service
    participant mail as Mail Service
    participant db as Storage
    Note over web,db: The user must be logged in to submit blog posts
    web->>+account: Logs in using credentials
    account->>db: Query stored accounts
    db->>account: Respond with query result
    alt Credentials not found
        account->>web: Invalid credentials
    else Credentials found
        account->>-web: Successfully logged in
        Note over web,db: When the user is authenticated, they can now submit new posts
        web->>+blog: Submit new post
        blog->>db: Store post data
        par Notifications
            blog--)mail: Send mail to blog subscribers
            blog--)db: Store in-site notifications
        and Response
            blog-->>-web: Successfully posted
        end
    end

</p>

```

<p class="mermaid">
sequenceDiagram
    participant web as Web Browser
    participant blog as Blog Service
    participant account as Account Service
    participant mail as Mail Service
    participant db as Storage
    Note over web,db: The user must be logged in to submit blog posts
    web->>+account: Logs in using credentials
    account->>db: Query stored accounts
    db->>account: Respond with query result
    alt Credentials not found
        account->>web: Invalid credentials
    else Credentials found
        account->>-web: Successfully logged in
        Note over web,db: When the user is authenticated, they can now submit new posts
        web->>+blog: Submit new post
        blog->>db: Store post data
        par Notifications
            blog--)mail: Send mail to blog subscribers
            blog--)db: Store in-site notifications
        and Response
            blog-->>-web: Successfully posted
        end
    end

</p>

## Plantuml Diagram

Use the following code snippet to add a Plantuml diagram in mark down:


```
```plantuml
@startuml
 
class User {
    - username: String
    - password: String
    - email: String
    + login()
    + register()
}

class Product {
    - name: String
    - price: double
    - description: String
}

class Cart {
    - items: List<Product>
    + addProduct(product: Product)
    + removeProduct(product: Product)
}

User "has" --* Cart : "shopping cart"
User "can view" --* Product : "products"
Cart *--* Product : "contains" 

@enduml
```

```plantuml
@startuml
 
class User {
    - username: String
    - password: String
    - email: String
    + login()
    + register()
}

class Product {
    - name: String
    - price: double
    - description: String
}

class Cart {
    - items: List<Product>
    + addProduct(product: Product)
    + removeProduct(product: Product)
}

User "has" --* Cart : "shopping cart"
User "can view" --* Product : "products"
Cart *--* Product : "contains" 

@enduml
```




