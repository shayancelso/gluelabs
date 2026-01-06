# Development Backlog

Product roadmap and feature ideas for the Gloo platform. Each item includes scope assessment to help prioritize.

---

## Nice to Have

### 1. Chat Widget Attachment Support
**Status:** Scoped | **Effort:** 2-4 hours | **Priority:** Low

Allow visitors to send images and files through the chat widget.

**What's needed:**
- Supabase Storage bucket for file uploads
- Add columns to `messages` table (attachment_url, attachment_type, attachment_name)
- Widget JS: file picker, upload logic, display attachments (~150 lines)
- Widget CSS: attachment button, image previews (~50 lines)
- CRM (Lovable): Update chat view to display/download attachments

**Security considerations:**
- File type restrictions (images, PDFs, common docs)
- 10MB file size limit
- Storage bucket policies

**Simpler alternative:** Image-only support (~1-2 hours)

---

## Completed

_Items move here after implementation_

---

## How to Use This Document

### Adding New Ideas
```markdown
### [Feature Name]
**Status:** Idea | Scoped | In Progress | Completed
**Effort:** Low (< 1 hr) | Medium (1-4 hrs) | High (4+ hrs)
**Priority:** Low | Medium | High

Brief description of the feature.

**What's needed:**
- Bullet points of implementation steps

**Notes:**
- Any additional context
```

### Status Definitions
- **Idea** - Just a thought, needs scoping
- **Scoped** - Analyzed, we know the effort required
- **In Progress** - Currently being built
- **Completed** - Done and deployed
