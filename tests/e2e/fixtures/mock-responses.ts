/**
 * Mock Responses for E2E Tests
 *
 * Centralized mock API responses for testing upload flows.
 */

/**
 * Prepare Bunny Upload Response
 */
export const prepareBunnyUploadResponse = {
  success: {
    message: 'Video prepared successfully',
    video_id: 12345,
    video_uuid: 'mock-uuid-12345',
    bunny_video_id: 'mock-bunny-12345',
    upload_config: {
      endpoint: 'https://mock-tus.bunny.net/tusupload',
      headers: {
        AuthorizationSignature: 'mock-signature',
        AuthorizationExpire: Date.now() + 3600000,
        LibraryId: 'mock-library',
        VideoId: 'mock-bunny-12345',
      },
    },
  },
  error: {
    message: 'Failed to prepare upload',
    errors: {
      video: ['Could not initialize video upload'],
    },
  },
};

/**
 * Video Update Response
 */
export const videoUpdateResponse = {
  success: {
    success: true,
    video: {
      id: 12345,
      uuid: 'mock-uuid-12345',
      title: 'Updated Video Title',
      description: 'Updated description',
      status: 'draft',
    },
  },
  error: {
    message: 'Failed to update video',
    errors: {
      title: ['Title is required'],
    },
  },
};

/**
 * Schedule Response Factory
 */
export const scheduleResponse = {
  createAuto: () => ({
    success: true,
    data: {
      schedule: {
        id: 1,
        video_id: 12345,
        publish_mode: 'auto',
        scheduled_at: null,
        notify: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    message: 'Video published successfully',
  }),
  createScheduled: (scheduledAt: string) => ({
    success: true,
    data: {
      schedule: {
        id: 1,
        video_id: 12345,
        publish_mode: 'scheduled',
        scheduled_at: scheduledAt,
        notify: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    message: 'Video scheduled successfully',
  }),
  error: {
    message: 'Failed to create schedule',
    errors: {
      schedule: ['Invalid publish mode'],
    },
  },
};

/**
 * Tags List Response
 */
export const tagsListResponse = {
  success: {
    data: [
      { id: 1, name: 'Music', slug: 'music' },
      { id: 2, name: 'Entertainment', slug: 'entertainment' },
      { id: 3, name: 'Comedy', slug: 'comedy' },
      { id: 4, name: 'Education', slug: 'education' },
      { id: 5, name: 'Sports', slug: 'sports' },
    ],
  },
};

/**
 * Error Responses
 */
export const errorResponses = {
  unauthorized: {
    status: 401,
    body: {
      message: 'Unauthorized',
      errors: {
        auth: ['Please sign in to continue'],
      },
    },
  },
  forbidden: {
    status: 403,
    body: {
      message: 'Forbidden',
      errors: {
        auth: ['You do not have permission to perform this action'],
      },
    },
  },
  notFound: {
    status: 404,
    body: {
      message: 'Not found',
      errors: {
        resource: ['The requested resource does not exist'],
      },
    },
  },
  serverError: {
    status: 500,
    body: {
      message: 'Internal Server Error',
      errors: {
        server: ['Something went wrong. Please try again later.'],
      },
    },
  },
  validationError: {
    status: 422,
    body: {
      message: 'Validation failed',
      errors: {
        title: ['Title is required'],
        tags: ['At least 2 tags are required'],
      },
    },
  },
};

/**
 * TUS Protocol Responses
 */
export const tusResponses = {
  options: {
    status: 204,
    headers: {
      'Tus-Resumable': '1.0.0',
      'Tus-Version': '1.0.0',
      'Tus-Extension': 'creation,creation-with-upload,termination',
      'Tus-Max-Size': '21474836480', // 20GB
    },
  },
  createSuccess: (location: string) => ({
    status: 201,
    headers: {
      Location: location,
      'Tus-Resumable': '1.0.0',
    },
  }),
  patchSuccess: (offset: number) => ({
    status: 204,
    headers: {
      'Upload-Offset': String(offset),
      'Tus-Resumable': '1.0.0',
    },
  }),
  headSuccess: (offset: number, length: number) => ({
    status: 200,
    headers: {
      'Upload-Offset': String(offset),
      'Upload-Length': String(length),
      'Tus-Resumable': '1.0.0',
    },
  }),
};
