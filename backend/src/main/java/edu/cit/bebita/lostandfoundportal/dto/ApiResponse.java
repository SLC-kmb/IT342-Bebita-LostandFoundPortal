package edu.cit.bebita.lostandfoundportal.dto;

import java.time.Instant;

public class ApiResponse<T> {

    private boolean success;
    private T data;
    private ApiError error;
    private String timestamp;

    private ApiResponse(boolean success, T data, ApiError error) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.timestamp = Instant.now().toString();
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> error(ApiError error) {
        return new ApiResponse<>(false, null, error);
    }

    public boolean isSuccess() { return success; }
    public T getData() { return data; }
    public ApiError getError() { return error; }
    public String getTimestamp() { return timestamp; }
}
