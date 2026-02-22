export type TDateISO = string;

export interface NoteEditor {
  visible: boolean;
  splitScreen: boolean;
  loadedText: string;
  updateViewText: (updatedView: string) => void;
  passUpdatedViewText: string;
}

export interface NoteEditorView {
  visible: boolean;
  splitScreen: boolean;
  viewText: string;
  updatedViewText: (updatedEdit: string) => void;
}

export interface ViewNoteThumb {
  text: string;
}

export interface ViewNoteMarkdownProps {
  viewText: string;
  scrollView?: number;
  splitScreen?: boolean;
  updatedViewText?: (updatedEdit: string) => void;
  onViewTextUpdate?: (text: string) => void;
  disableLinks?: boolean;
}

export interface Note {
  _id: string;
  note: string;
  notebook: string;
  createdAt: TDateISO | "No date";
  updatedAt: TDateISO | "No date";
}

export interface Notebook {
  _id: string;
  notebook_name: string;
  notebook_cover: NotebookCoverType;
  createdAt?: TDateISO | "No date";
  updatedAt?: TDateISO | "No date";
}

export interface CreateNoteObj {
  notebookId: string;
  note: string;
}

export type CreateNote =
  | { error: string; success?: never; note?: never }
  | { error?: never; success: boolean; note: { insertedId: string } };

export type DeleteNotebook =
  | {
      error: string;
      success?: never;
      notebook_deleted?: never;
      server_response?: never;
    }
  | {
      error?: never;
      success: boolean;
      notebook_deleted: string;
      server_response: unknown;
    };

export type EditNotebookDate =
  | {
      error: string;
      success?: never;
      notebook_deleted?: never;
      server_response?: never;
    }
  | {
      error?: never;
      success: boolean;
      notebook_deleted: string;
      server_response: unknown;
    };

export type EditNotebook =
  | { error: string; success?: never; notebook_edited?: never }
  | { error?: never; success: boolean; notebook_edited: Notebook };

export type GetNotebook =
  | { error: string; success?: never; notebook?: never }
  | { error?: never; success: boolean; notebook: Notebook };

export interface GetNotebooksError {
  error: string;
  success?: never;
  notebooks?: never;
}

export interface GetNotebooksSuccess {
  error?: never;
  success: boolean;
  notebooks: Notebook[];
}

export type GetNotebooks = GetNotebooksError | GetNotebooksSuccess;

export interface CheckedNote {
  id: string;
  selected: boolean;
}

export interface SelectedNote {
  selected: string[];
}

export type NotebookCoverType = "default" | "red" | "green" | "blue";

export type PageType = "notebooks" | "notebook" | "note" | "profile" | "other";

export type NotebookType = {
  name: string;
  id: string;
  cover: NotebookCoverType;
};

export interface Edited {
  _id: string;
  notebook_name: string;
  notebook_cover: NotebookCoverType;
}

export type NotificationStatus = "pending" | "success" | "error" | null;

export interface NotificationInterface {
  n_status: NotificationStatus | null;
  title: string | null;
  message: string | null;
}

export type NotificationObject = {
  notification: NotificationInterface;
};

export type ErrorSeverity = "" | "error" | "warning" | "info" | "success";

export interface AlertInterface {
  error_state?: boolean;
  error_severity?: ErrorSeverity;
  message?: string;
}

export interface NewUsernameObj {
  newUsername: string;
}

export interface ChangePasswordObj {
  oldPassword: string | undefined;
  newPassword: string | undefined;
}

export interface ProfileFormProps {
  onChangePassword: (arg0: ChangePasswordObj) => void;
  onChangeUsername: (arg0: NewUsernameObj) => void;
  userName: string | undefined;
}

export interface Snack {
  n_status: boolean | null;
  message: string | null;
}

export type DeleteNotes =
  | { success?: never; notes_deleted?: never; error: string }
  | { success: boolean; notes_deleted: unknown; error?: never };

export type GetNote =
  | { success?: never; note?: never; error: string }
  | { success: boolean; note: Note; error?: never };

export type GetNotes =
  | { success?: never; notes?: never; error: string }
  | { success: boolean; notes: Note[]; error?: never };

export type MoveNotes =
  | {
      success?: never;
      notes_moved?: never;
      server_response?: never;
      error: string;
    }
  | {
      success: boolean;
      notes_moved: string[];
      server_response: unknown;
      error?: never;
    };

export type SaveNote =
  | { success?: never; server_response?: never; error: string }
  | { success: boolean; server_response: unknown; error?: never };

export type ChangePassword =
  | { success?: never; error: string }
  | { success: boolean; error?: never };

export type ChangeUsername =
  | { success?: never; details?: never; error: string }
  | { success: boolean; details: IAuthDetails; error?: never };

export type Logout =
  | { success?: never; error: string }
  | { success: boolean; error?: never };

export interface IAuthDetails {
  authStrategy: string;
  username: string;
  email: string;
  __v: number;
  _id: string;
}

export type onLoginT = (
  email: string,
  password: string,
) => Promise<AuthAuthenticate> | void;
export type onRegisterT = (
  username: string,
  email: string,
  password: string,
  framework: string,
) => Promise<AuthSignup> | void;

export interface IAuthContext {
  loading: boolean | null;
  success: boolean | null;
  token: string | null;
  details: IAuthDetails | null;
  onLogin: onLoginT;
  onRegister: onRegisterT;
  onLogout: () => void;
  notebookID: string | null;
  noteID: string | null;
}

export type AuthAuthenticate =
  | { success?: never; token?: never; details?: never; error: string }
  | { success: boolean; token: string; details: IAuthDetails; error?: never }
  | undefined;

export type AuthSignup =
  | (AuthAuthenticate & { notebookID?: string; noteID?: string })
  | undefined;

export type ButtonSize = "small" | "default";

export interface NotePageProps {
  params?: Record<string, string> | null;
}
