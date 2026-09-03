import type { ApiGeneralResponse, ApiResponse } from "../interfaces/Response";
import { api } from "../redux/ApiSlice";
interface Questcredentials {
  question: string;
  answer: string;
}
interface faqcredentials {
  title: string;
  faqs: Questcredentials[];
}
interface faqCat {
  _id: string;
  title: string;
  faqs: faqInterface[];
}
interface faqInterface {
  _id: string;
  question: string;
  answer: string;
}
interface emergencyCredentials {
  label: string;
  phone: string;
}
interface emergencyResData {
  _id: string;
  label: string;
  phone: string;
}
type EmergencyResponse = ApiResponse<emergencyResData[]>;
type FAQResponse = ApiResponse<faqCat[]>;
const FAQapi = api.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation<ApiGeneralResponse, faqcredentials>({
      query: (credentials) => ({
        url: "/faq/category",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["FAQ"],
    }),
    AllCategories: builder.query<FAQResponse, void>({
      query: () => ({
        url: "/faq/category",
        method: "GET",
      }),
      keepUnusedDataFor: 300,
      providesTags: ["FAQ"],
    }),
    deleteCategory: builder.mutation<ApiGeneralResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/faq/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FAQ"],
    }),
    AddQuestion: builder.mutation<
      ApiGeneralResponse,
      { questions: Questcredentials[]; id: string }
    >({
      query: ({ questions, id }) => ({
        url: `/faq/category/${id}/question`,
        method: "POST",
        body: { questions },
      }),
      invalidatesTags: ["FAQ"],
    }),
    EditQuestion: builder.mutation<
      ApiGeneralResponse,
      { faq: Questcredentials; qid: string; cid: string }
    >({
      query: ({ cid, qid, faq }) => ({
        url: `/faq/category/${cid}/question/${qid}`,
        method: "PATCH",
        body: faq,
      }),
      invalidatesTags: ["FAQ"],
    }),
    deleteQuestion: builder.mutation<
      ApiGeneralResponse,
      { qid: string; cid: string }
    >({
      query: ({ qid, cid }) => ({
        url: `/faq/category/${cid}/question/${qid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FAQ"],
    }),
    AddEmergencyContact: builder.mutation<
      ApiGeneralResponse,
      emergencyCredentials
    >({
      query: (credentials) => ({
        url: "/faq/emergency-contact/",
        body: credentials,
        method: "POST",
      }),
      invalidatesTags: ["EmergencyContact"],
    }),
    editEmergencyContact: builder.mutation<
      ApiGeneralResponse,
      { id: string; eme: emergencyCredentials }
    >({
      query: ({ eme, id }) => ({
        url: `/faq/emergency-contact/${id}`,
        body: eme,
        method: "PATCH",
      }),
      invalidatesTags: ["EmergencyContact"],
    }),
    viewEmergencyContacts: builder.query<EmergencyResponse, void>({
      query: () => ({
        url: "/faq/emergency-contact",

        method: "GET",
      }),
      providesTags: ["EmergencyContact"],
    }),
    deleteEmergencyContact: builder.mutation<
      ApiGeneralResponse,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/faq/emergency-contact/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmergencyContact"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useAddQuestionMutation,
  useAllCategoriesQuery,
  useDeleteCategoryMutation,
  useEditQuestionMutation,
  useDeleteQuestionMutation,
  useAddEmergencyContactMutation,
  useDeleteEmergencyContactMutation,
  useEditEmergencyContactMutation,
  useViewEmergencyContactsQuery,
  useLazyAllCategoriesQuery,useLazyViewEmergencyContactsQuery
} = FAQapi;
