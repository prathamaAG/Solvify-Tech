import React, { useCallback, useEffect, useRef, useState } from "react";
import {
   Avatar,
   Box,
   Button,
   Divider,
   IconButton,
   List,
   ListItem,
   ListItemAvatar,
   ListItemText,
   Paper,
   Popover,
   styled,
   TextField,
   Tooltip,
   Typography,
   CircularProgress
} from "@mui/material";
import { EditorState, RichUtils, convertToRaw, Modifier } from "draft-js";
import Editor from "@draft-js-plugins/editor";
import draftToHtml from 'draftjs-to-html';
import createMentionPlugin, { defaultSuggestionsFilter } from "@draft-js-plugins/mention";
import "draft-js/dist/Draft.css";
import Picker from "emoji-picker-react";
import bold_icon from '../../assets/images/bold_icon.svg';
import underline_icon from '../../assets/images/underline_icon.svg';
import EmojiPickerIcon from '../../assets/images/emoji_picker.png';
import FileUploadIcon from '../../assets/images/file_upload.png';
import italic_icon from '../../assets/images/italic_icon.svg';
import list_icon from '../../assets/images/list_icon.svg';
import sendIcon from '../../assets/images/message-send-icon.svg'
import dayjs from "dayjs";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"; // Default file icon
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"; // PDF icon
import DescriptionIcon from "@mui/icons-material/Description"; // DOCX icon
import FolderZipIcon from "@mui/icons-material/FolderZip";
import { apiService, commonService } from '../../services';

const mentionPlugin = createMentionPlugin()
const { MentionSuggestions } = mentionPlugin
const plugins = [mentionPlugin]

const membersList = [];

const ToolbarContainer = styled(Paper)(({ theme, isDragging }) => ({
   position: "sticky",
   bottom: 0,
   borderTop: "12px",
   backgroundColor: isDragging ? "#E3F2FD" : "#ffffff",
   // border: isDragging ? "4px solid #1E88E5" : "1px solid #E6E6E6",
   transition: "all 0.2s ease-in-out",
   boxShadow: "none"
}));

const ToolbarHeader = styled(Box)({
   backgroundColor: "#F4F4F4",
   boxShadow: "none",
   padding: "2px 6px",
   display: "flex",
   justifyContent: "space-between",
   alignItems: "center",
   borderTop: "12px",
});

const CommentSection = ({ task_id }) => {
   // console.log("task_id", task_id);
   const [pageInformation, setPageInformation] = useState({});
   const [mentionUserList, setMentionUserList] = useState([]);
   const [showPicker, setShowPicker] = useState(false);

   const [file, setFile] = useState([]);

   const pickerRef = useRef();
   const emojiButtonRef = useRef();
   const commentSectionRef = useRef();
   const isMounted = useRef(false);
   const editor = useRef(null);

   const [comments, setComments] = useState([]);
   const [loading, setLoading] = useState(false);

   const mentions = (membersList || []).map((member) => {
      if (member.value !== null) {
         return {
            userId: member.value,
            name: member.label,
         };
      }
      return null;
   }).filter(Boolean);
   const [editorState, setEditorState] = useState(EditorState.createEmpty());
   const [suggestions, setSuggestions] = useState(mentions);

   const [open, setOpen] = useState(false); // To manage open/close state
   const isEditorEmpty = editorState.getCurrentContent().hasText();




   // useEffect(() => {
   //    const handleClickOutside = (event) => {
   //       console.log("Click outside detected");

   //       // Delay execution to allow emoji click to be registered
   //       setTimeout(() => {
   //          if (
   //             pickerRef.current &&
   //             !pickerRef.current.contains(event.target) &&
   //             emojiButtonRef.current &&
   //             !emojiButtonRef.current.contains(event.target)
   //          ) {
   //             console.log("Closing picker");
   //             setShowPicker(false);
   //          }
   //       }, 100); // 100ms delay
   //    };

   //    document.addEventListener("mousedown", handleClickOutside);
   //    return () => {
   //       document.removeEventListener("mousedown", handleClickOutside);
   //    };
   // }, [pickerRef, emojiButtonRef, showPicker]);


   useEffect(() => {
      const fetchComments = async () => {
         try {
            setLoading(true);
            const response = await apiService.GetAPICall("getComments", task_id);
            if (response.data) {
               setComments(response.data);
            }
         } catch (error) {
            commonService.resetAPIFlag("getComments", false);
            console.error('Error fetching comments:', error);
         } finally {
            commonService.resetAPIFlag("getComments", false);
            setLoading(false);
         }
      };

      if (task_id) {
         fetchComments();
      }
   }, [task_id]);

   const handleEditorChange = (state) => {
      // console.log("onChange", state.getCurrentContent());
      setEditorState(state);
   };

   const convertMessageToText = () => {
      const contentState = editorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);

      const htmlMessage = draftToHtml(rawContent);  // Or use custom logic to convert to string

      return htmlMessage.trim();
   };
   const handleSendMessage = () => {
      const messageContent = convertMessageToText();

      // Remove HTML tags, &nbsp; and trim the result to check for empty message
      const strippedMessage = messageContent
         .replace(/<[^>]*>?/gm, '')  // Remove HTML tags
         .replace(/&nbsp;/g, '')     // Remove non-breaking spaces
         .trim();                    // Trim any remaining whitespace

      if (file.length === 0 && strippedMessage === '') {
         // errorNotification('Please enter a message or select a file');
         return;
      }

      const mentionUsers = onExtractMentions();

      sendMessage(messageContent, mentionUsers);
   };

   const sendMessage = async (messageContent) => {
      const formData = new FormData();
      formData.append('task_id', task_id);
      formData.append('text', messageContent);
      formData.append('htmlText', messageContent);

      // Append files if any
      file.forEach((file) => {
         formData.append('files', file);
      });

      try {
         setLoading(true);
         const response = await apiService.PostFormDataAPICall("createComment", formData);

         if (response.data) {
            setComments(prev => [response.data, ...prev]);
            setEditorState(EditorState.createEmpty());
            setFile([]);
         }
         commonService.resetAPIFlag("createComment", false);
      } catch (error) {
         commonService.resetAPIFlag("createComment", false);
         console.error('Error creating comment:', error);
      } finally {
         commonService.resetAPIFlag("createComment", false);
         setLoading(false);
      }
   };

   const onChange = useCallback((newEditorState) => {
      const contentState = newEditorState.getCurrentContent();
      // If all content is cleared (e.g., after Ctrl + A and delete)
      if (!contentState.hasText()) {
         // Reset editor state to prevent stale entities
         const resetEditorState = EditorState.createEmpty();
         setEditorState(resetEditorState);
      } else {
         setEditorState(newEditorState);
      }
   }, []);

   const onToggle = useCallback((style) => {
      onChange(RichUtils.toggleInlineStyle(editorState, style));
   }, [editorState, onChange]);

   const onBlockToggle = useCallback((blockType) => {
      onChange(RichUtils.toggleBlockType(editorState, blockType));
   }, [editorState, onChange]);


   const onOpenChange = (newOpenState) => {
      setOpen(newOpenState);
   };

   const onSearchChange = ({ value }) => {
      if (!editorState.getCurrentContent().hasText()) {
         // Clear suggestions when content is deleted
         setSuggestions([]);
         return;
      }

      // Filter and update suggestions
      const filteredSuggestions = defaultSuggestionsFilter(value, mentions);
      setSuggestions(filteredSuggestions);
   };

   // Focus on editor window
   const focusEditor = () => {
      editor.current.focus()
   }

   const onAddMention = (mentionId) => {
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity('MENTION', 'IMMUTABLE', { id: mentionId });
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
      const newState = Modifier.replaceText(newEditorState.getCurrentContent(), newEditorState.getSelection(), `@${mentionId}`, null, entityKey);
      setEditorState(EditorState.push(newEditorState, newState, 'insert-characters'));
   }

   const onExtractMentions = () => {
      const contentState = editorState.getCurrentContent();
      const raw = convertToRaw(contentState);
      let mentionedUsers = [];
      for (let key in raw.entityMap) {
         const ent = raw.entityMap[key];
         if (ent.type === "mention") {
            mentionedUsers.push(ent.data.mention);
         }
      }
      setMentionUserList(mentionedUsers);
      return mentionedUsers;
   };

   const onEmojiClick = (emojiObject, event) => {

      const emoji = emojiObject.emoji; // Ensure this is the correct key for emoji

      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();

      const contentStateWithEmoji = Modifier.insertText(
         contentState,
         selectionState,
         emoji
      );

      const newEditorState = EditorState.push(
         editorState,
         contentStateWithEmoji,
         'insert-characters'
      );

      setShowPicker(false);
      setEditorState(newEditorState);
   };


   const handlePickerModal = () => {
      setShowPicker(val => !val);
   };

   const handleFileChange = (event) => {
      const newFiles = Array.from(event.target.files);
      setFile((prev) => [...prev, ...newFiles]); // Append new files
   };

   // const handleFileChange = (event) => {
   //    const files = [...event.target.files];
   //    const newFiles = files.map(file => ({
   //       name: file.name,
   //       type: file.type,
   //       file: file,
   //       preview: URL.createObjectURL(file)
   //    }));

   //    newFiles.forEach((fileObj, index) => {
   //       const reader = new FileReader();
   //       reader.onload = (e) => {
   //          const content = e.target.result;
   //          setFile(prevFiles => {
   //             const updatedFiles = [...prevFiles];
   //             updatedFiles[prevFiles.length + index] = { ...fileObj, content };
   //             return updatedFiles;
   //          });
   //       };
   //       reader.readAsText(fileObj.file);
   //    });
   // };

   const handleRemoveFile = (index) => {
      setFile(file.filter((_, i) => i !== index));
   };

   const getInitials = (name) => {
      if (!name) return '?';
      const names = name.split(' ');
      let initials = names[0].substring(0, 1).toUpperCase();
      if (names.length > 1) {
         initials += names[names.length - 1].substring(0, 1).toUpperCase();
      }
      return initials;
   };

   const stringToColor = (string) => {
      let hash = 0;
      let i;

      for (i = 0; i < string.length; i += 1) {
         hash = string.charCodeAt(i) + ((hash << 5) - hash);
      }

      let color = '#';

      for (i = 0; i < 3; i += 1) {
         const value = (hash >> (i * 8)) & 0xff;
         color += `00${value.toString(16)}`.slice(-2);
      }

      return color;
   };

   const getFileIcon = (fileType) => {
      if (fileType.includes("pdf")) return <PictureAsPdfIcon fontSize="large" color="error" />;
      if (fileType.includes("zip")) return <FolderZipIcon fontSize="large" color="primary" />;
      if (fileType.includes("word") || fileType.includes("msword") || fileType.includes("document"))
         return <DescriptionIcon fontSize="large" color="primary" />;
      return <InsertDriveFileIcon fontSize="large" color="action" />;
   };

   const renderMessageWithMentions = (message, mention_users = []) => {
      if (mention_users === null || mention_users.length === 0) {
         return message;
      }

      return Array.isArray(mention_users)
         ? mention_users.reduce((msg, mention) => {
            const regex = new RegExp(`${mention.name}`, 'g');
            return msg.replace(regex, `<span style="color:#0067ff;">${mention.name}</span>`);
         }, message)
         : message;
   };

   return (
      <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", display: "flex", flexDirection: "column", maxHeight: "100vh", overflowY: "auto" }}>
         <Typography variant="h6">Comments</Typography>
         {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
               <CircularProgress size={24} />
            </Box>
         )}

         <Paper sx={{ p: 1, flexGrow: 1, overflowY: "auto", borderRadius: 2, boxShadow: "none" }}>
            <List sx={{ height: "100%", maxHeight: 450, overflowY: "auto" }}>
               {comments.map((comment) => (
                  <React.Fragment key={comment.comment_id}>
                     <ListItem alignItems="flex-start" disableGutters>
                        <ListItemAvatar>
                           {comment.commentSender?.avatar ? (
                              <Avatar
                                 src={comment.commentSender.avatar}
                                 alt={comment.commentSender.name}
                                 sx={{
                                    height: "32px",
                                    width: "32px",
                                    borderRadius: "100%",
                                    border: "1px solid #000"
                                 }}
                              />
                           ) : (
                              <Avatar
                                 sx={{
                                    height: "32px",
                                    width: "32px",
                                    bgcolor: stringToColor(comment.commentSender?.name || 'Unknown'),
                                    fontSize: '0.875rem',
                                    fontWeight: 800,
                                    border: "1px solid #000"
                                 }}
                              >
                                 {getInitials(comment.commentSender?.name)}
                              </Avatar>
                           )}
                        </ListItemAvatar>
                        <ListItemText
                           primary={
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                 <Typography variant="body1" fontWeight="bold">
                                    {comment.commentSender?.name}
                                 </Typography>
                                 <Typography variant="caption" color="textSecondary">
                                    {dayjs(comment.created_at).format("hh:mm A")}
                                 </Typography>
                              </Box>
                           }
                           secondary={
                              <>
                                 <Typography variant="body2" color="textPrimary">
                                    <div dangerouslySetInnerHTML={{ __html: comment.htmlText }} />
                                 </Typography>
                                 {comment.files?.length > 0 && (
                                    <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                                       {comment.files.map((file, fileIndex) => (
                                          <Paper
                                             key={fileIndex}
                                             sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                px: 2,
                                                py: 1,
                                                border: "1px solid #cfcbcb",
                                                borderRadius: 1,
                                                width: 250,
                                             }}
                                          >
                                             <Box sx={{ flexGrow: 1 }}>
                                                <Typography
                                                   variant="body2"
                                                   sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                                >
                                                   {file.name}
                                                </Typography>
                                             </Box>
                                             <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                                                <IconButton size="small">
                                                   👁️
                                                </IconButton>
                                             </a>
                                          </Paper>
                                       ))}
                                    </Box>
                                 )}
                              </>
                           }
                        />
                     </ListItem>
                  </React.Fragment>
               ))}
            </List>
         </Paper>
         {showPicker && (
            <Popover
               open={showPicker}
               anchorEl={pickerRef.current}
               onClose={() => setShowPicker(false)}
               anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
               }}
               transformOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
               }}
            >
               <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                  <Box sx={{ height: 350 }}>
                     <Picker onEmojiClick={(emoji, event) => onEmojiClick(emoji, event)} />
                  </Box>
               </Paper>
            </Popover>
         )}

         {
            <Popover
               open={open}
               // anchorEl={mentionRef.current}
               onClose={() => onOpenChange(false)}
               anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
               }}
               transformOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
               }}
            >
               <MentionSuggestions
                  onSearchChange={onSearchChange}
                  suggestions={suggestions}
                  onAddMention={onAddMention}
                  open={open}
               />
            </Popover>
         }
         <Box sx={{ border: "1px solid rgb(134, 134, 134)", borderRadius: 2, overflow: "hidden" }}>

            <ToolbarContainer elevation={3} >
               <ToolbarHeader>
                  {/* Formatting Buttons */}
                  <Box sx={{ display: "flex", gap: 2 }}>
                     <Tooltip title="Bold">
                        <IconButton onMouseDown={(e) => { e.preventDefault(); onToggle("BOLD"); }}>
                           <img src={bold_icon} alt="Bold" />
                        </IconButton>
                     </Tooltip>
                     <Tooltip title="Italic">
                        <IconButton onMouseDown={(e) => { e.preventDefault(); onToggle("ITALIC"); }}>
                           <img src={italic_icon} alt="Italic" />
                        </IconButton>
                     </Tooltip>
                     <Tooltip title="Underline">
                        <IconButton onMouseDown={(e) => { e.preventDefault(); onToggle("UNDERLINE"); }}>
                           <img src={underline_icon} alt="Underline" />
                        </IconButton>
                     </Tooltip>
                     <Tooltip title="Unordered List">
                        <IconButton onMouseDown={(e) => { e.preventDefault(); onBlockToggle("unordered-list-item"); }}>
                           <img src={list_icon} alt="List" />
                        </IconButton>
                     </Tooltip>  {/*
                  <Tooltip title="Ordered List">
                     <IconButton onMouseDown={(e) => { e.preventDefault(); onBlockToggle("ordered-list-item"); }}>
                        <BiListOl size={22} />
                     </IconButton>
                  </Tooltip>*/}
                     <Tooltip title="Upload File">
                        <IconButton component="label">
                           <input type="file" hidden onChange={handleFileChange} />
                           <img src={FileUploadIcon} alt="Upload" style={{ width: 20, height: 20, cursor: "pointer" }} />
                        </IconButton>
                     </Tooltip>
                     <Tooltip ref={pickerRef} title="Emoji">
                        <IconButton onClick={handlePickerModal} ref={emojiButtonRef}>
                           <img alt="Emoji Picker" style={{ width: 20, height: 20 }} src={EmojiPickerIcon} />
                        </IconButton>
                     </Tooltip>
                  </Box>
                  {/* Send Button */}
                  <Tooltip title="Send">
                     <IconButton onClick={handleSendMessage}>
                        <img src={sendIcon} alt="Send" />
                     </IconButton>
                  </Tooltip>
               </ToolbarHeader>
            </ToolbarContainer>
            <Box sx={{ p: 1, px: 2, position: "relative" }} onClick={() => focusEditor()}>
               {!isEditorEmpty && (
                  <Typography
                     sx={{
                        position: "absolute",
                        left: 16,  // Equivalent to left-4 (4 * 4px = 16px)
                        top: 7,    // Equivalent to top-1 (1 * 4px = 4px)
                        color: "#ccc",
                     }}
                  >
                     Type your message...
                  </Typography>
               )}
               <Editor ref={editor} editorState={editorState} onChange={handleEditorChange} />
               {file.map((singleFile, index) => (
                  <Box
                     key={index}
                     sx={{
                        position: "relative",
                        width: 100,
                        height: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        overflow: "hidden",
                        backgroundColor: "#f9f9f9",
                        "&:hover .delete-btn": { display: "flex" }, // Show delete button on hover
                     }}
                  >
                     {/* Show Image Preview */}
                     {singleFile.type.startsWith("image/") ? (
                        <img
                           src={URL.createObjectURL(singleFile)}
                           alt="Preview"
                           style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                     ) : (
                        // Show singleFile type icon
                        <Box sx={{ textAlign: "center" }}>
                           {getFileIcon(singleFile.type)}
                           <Typography sx={{ fontSize: 12, mt: 1 }}>{singleFile.name.split(".").pop()}</Typography>
                        </Box>
                     )}

                     {/* Remove Button (Only visible on hover) */}
                     <IconButton
                        className="delete-btn"
                        onClick={() => handleRemoveFile(index)}
                        sx={{
                           position: "absolute",
                           top: 2,
                           right: 2,
                           display: "none",
                           backgroundColor: "rgba(0,0,0,0.6)",
                           color: "white",
                           "&:hover": { backgroundColor: "black" },
                        }}
                        size="small"
                     >
                        <DeleteIcon fontSize="small" />
                     </IconButton>
                  </Box>
               ))}
            </Box>
         </Box>


      </Box>
   );
};

export default CommentSection;
