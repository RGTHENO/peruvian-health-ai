

## Issue

The dropdown menu is too wide and extends leftward, overlapping the notification bell area. It should be narrower and aligned strictly under the doctor profile button.

## Fix

In `src/layouts/DoctorLayout.tsx`, reduce the dropdown width from `w-56` to `w-48` and ensure `align="end"` keeps it right-aligned under the trigger button. This way the dropdown's right edge matches the button's right edge and doesn't bleed over the bell icon.

### File: `src/layouts/DoctorLayout.tsx`
- Change `DropdownMenuContent` className from `w-56` to `w-48`
- Keep `align="end"` and `sideOffset={8}` as-is

Single-line change, no structural modifications needed.

