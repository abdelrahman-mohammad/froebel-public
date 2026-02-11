package io.froebel.backend.course.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record ReorderMaterialsRequest(
    @NotNull(message = "Material orders are required")
    @Size(min = 1, message = "At least one material order must be provided")
    @Valid
    List<MaterialOrderItem> materialOrders
) {
    public record MaterialOrderItem(
        @NotNull(message = "Material ID is required")
        UUID materialId,

        @NotNull(message = "Order is required")
        @Min(value = 0, message = "Order must be non-negative")
        Integer order
    ) {
    }
}
