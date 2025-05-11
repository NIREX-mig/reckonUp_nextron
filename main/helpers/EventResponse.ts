class EventResponse {
  success: boolean;
  message: string;
  data: any;
  constructor(success = true, message = 'Success', data) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

export default EventResponse;
